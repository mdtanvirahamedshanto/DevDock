import si from 'systeminformation';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import ping from 'ping';

const execAsync = promisify(exec);

// Session accumulators (reset on process restart)
let sessionRxBytes = 0;
let sessionTxBytes = 0;
let lastNetStats: { rx: number; tx: number } | null = null;

// Ping state (rolling jitter calculation)
let lastLatencyMs = 0;
let jitterHistory: number[] = [];

async function getPingLatency(): Promise<{ latencyMs: number; jitterMs: number }> {
  try {
    const result = await ping.promise.probe('1.1.1.1', { timeout: 3, extra: ['-c', '1'] });
    const latencyMs = result.alive ? (result.time as number) : -1;
    if (latencyMs > 0) {
      const jitter = lastLatencyMs > 0 ? Math.abs(latencyMs - lastLatencyMs) : 0;
      jitterHistory.push(jitter);
      if (jitterHistory.length > 10) jitterHistory.shift();
      lastLatencyMs = latencyMs;
      const avgJitter = jitterHistory.reduce((a, b) => a + b, 0) / jitterHistory.length;
      return { latencyMs, jitterMs: Math.round(avgJitter) };
    }
    return { latencyMs: -1, jitterMs: 0 };
  } catch {
    return { latencyMs: -1, jitterMs: 0 };
  }
}

async function getVmStat(): Promise<{
  wired: number;
  compressed: number;
  appMemory: number;
  pressureLevel: 'normal' | 'warning' | 'critical';
}> {
  if (process.platform !== 'darwin') {
    return { wired: 0, compressed: 0, appMemory: 0, pressureLevel: 'normal' };
  }
  try {
    const { stdout } = await execAsync('vm_stat');
    const pageSize = 4096;
    const getValue = (label: string) => {
      const match = stdout.match(new RegExp(`${label}:\\s+(\\d+)`));
      return match ? parseInt(match[1]) * pageSize : 0;
    };
    const wired = getValue('Pages wired down');
    const compressed = getValue('Pages occupied by compressor');
    const inactive = getValue('Pages inactive');
    const freePages = getValue('Pages free');
    const speculative = getValue('Pages speculative');
    const appMemory = wired + compressed + inactive;
    const totalPages = wired + compressed + inactive + freePages + speculative;
    const pressureRatio = totalPages > 0 ? (wired + compressed) / totalPages : 0;
    const pressureLevel: 'normal' | 'warning' | 'critical' =
      pressureRatio > 0.8 ? 'critical' : pressureRatio > 0.6 ? 'warning' : 'normal';
    return { wired, compressed, appMemory, pressureLevel };
  } catch {
    return { wired: 0, compressed: 0, appMemory: 0, pressureLevel: 'normal' };
  }
}

async function getAppleCoreTopology(): Promise<{ eCoreCount: number; pCoreCount: number }> {
  if (process.platform !== 'darwin') {
    return { eCoreCount: 0, pCoreCount: 0 };
  }
  try {
    const { stdout } = await execAsync(
      'sysctl -n hw.perflevel0.logicalcpu hw.perflevel1.logicalcpu 2>/dev/null',
    );
    const lines = stdout.trim().split('\n').map(Number);
    if (lines.length >= 2) {
      // perflevel0 = Performance (P-cores), perflevel1 = Efficiency (E-cores)
      return { pCoreCount: lines[0] || 0, eCoreCount: lines[1] || 0 };
    }
  } catch {
    // Silently fail on non-Apple-Silicon
  }
  return { eCoreCount: 0, pCoreCount: 0 };
}

async function getWifiDetails(): Promise<any> {
  try {
    const connections = await si.wifiConnections();
    if (connections && connections.length > 0) {
      const c = connections[0];
      return {
        ssid: c.ssid,
        bssid: c.bssid,
        channel: c.channel,
        frequency: c.frequency,
        signalLevel: c.signalLevel,
        quality: c.quality,
        security: (c as any).security || 'Unknown',
        protocol: (c as any).mode || 'Unknown',
      };
    }
  } catch {}
  return null;
}

export class MonitoringEngine {
  private coreTopologyCache: { eCoreCount: number; pCoreCount: number } | null = null;

  async getTick() {
    try {
      const [
        cpu,
        cpuLoad,
        cpuSpeed,
        mem,
        networkStats,
        networkInterfaces,
        temp,
        graphics,
        battery,
        bluetooth,
        fsSize,
        fsStats,
        loadAvg,
        memVm,
        wifiDetails,
      ] = await Promise.all([
        si.cpu(),
        si.currentLoad(),
        si.cpuCurrentSpeed(),
        si.mem(),
        si.networkStats(),
        si.networkInterfaces(),
        si.cpuTemperature(),
        si.graphics(),
        si.battery(),
        si.bluetoothDevices(),
        si.fsSize(),
        si.fsStats(),
        Promise.resolve(os.loadavg()),
        getVmStat(),
        getWifiDetails(),
      ]);

      // Lazy-load core topology (expensive sysctl call)
      if (!this.coreTopologyCache) {
        this.coreTopologyCache = await getAppleCoreTopology();
      }

      // Session network accumulators
      const statsArray = Array.isArray(networkStats) ? networkStats : [networkStats];
      const currentRx = statsArray.reduce((acc, s) => acc + (s?.rx_bytes || 0), 0);
      const currentTx = statsArray.reduce((acc, s) => acc + (s?.tx_bytes || 0), 0);
      if (lastNetStats !== null) {
        sessionRxBytes += Math.max(0, currentRx - lastNetStats.rx);
        sessionTxBytes += Math.max(0, currentTx - lastNetStats.tx);
      }
      lastNetStats = { rx: currentRx, tx: currentTx };

      // Disk I/O
      const fsStatsArray = Array.isArray(fsStats) ? fsStats : [fsStats];
      const totalRxSec = fsStatsArray.reduce((acc, s) => acc + (s?.rx_sec || 0), 0);
      const totalWxSec = fsStatsArray.reduce((acc, s) => acc + (s?.wx_sec || 0), 0);

      // CPU speeds per core
      const cpuSpeedArray: number[] = Array.isArray(cpuSpeed.cores)
        ? cpuSpeed.cores.map((c: any) => c || cpuSpeed.avg || 0)
        : Array(cpu.cores).fill(cpuSpeed.avg || 0);

      // Thermal sensors
      const coreSensors: { label: string; temp: number }[] = [
        ...(temp.cores || []).map((t: number, i: number) => ({ label: `CPU Core ${i}`, temp: t })),
        ...(temp.chipset ? [{ label: 'Chipset', temp: temp.chipset }] : []),
        ...(temp.socket
          ? temp.socket.map((t: number, i: number) => ({ label: `Socket ${i}`, temp: t }))
          : []),
      ].filter((s) => s.temp > 0);

      return {
        cpu: {
          load: cpuLoad.currentLoad,
          system: cpuLoad.currentLoadSystem,
          user: cpuLoad.currentLoadUser,
          idle: cpuLoad.currentLoadIdle,
          cores: cpuLoad.cpus.map((c) => ({
            load: c.load,
            system: c.loadSystem,
            user: c.loadUser,
            idle: c.loadIdle,
          })),
          brand: cpu.brand,
          physicalCores: cpu.physicalCores,
          coresTotal: cpu.cores,
          loadAvg1m: loadAvg[0],
          loadAvg5m: loadAvg[1],
          loadAvg15m: loadAvg[2],
          speeds: cpuSpeedArray,
          avgSpeedMhz: (cpuSpeed.avg || 0) * 1000,
          eCoreCount: this.coreTopologyCache.eCoreCount,
          pCoreCount: this.coreTopologyCache.pCoreCount,
        },
        mem: {
          total: mem.total,
          used: mem.active,
          free: mem.free,
          swapTotal: mem.swaptotal,
          swapUsed: mem.swapused,
          percentage: (mem.active / mem.total) * 100,
          wired: memVm.wired,
          compressed: memVm.compressed,
          appMemory: memVm.appMemory,
          pressureLevel: memVm.pressureLevel,
          buffers: mem.buffers || 0,
          cached: mem.cached || 0,
        },
        network: {
          interfaces: Array.isArray(networkInterfaces) ? networkInterfaces : [networkInterfaces],
          stats: statsArray,
          rx_sec: statsArray[0]?.rx_sec || 0,
          tx_sec: statsArray[0]?.tx_sec || 0,
          sessionRxBytes,
          sessionTxBytes,
          wifi: wifiDetails,
        },
        hardware: {
          temp: temp.main || 0,
          fanRpm: temp.max || 0,
          gpuLoad: 0, // Apple Silicon restricted
          controllers: graphics.controllers,
          displays: graphics.displays,
          sensors: coreSensors,
        },
        disk: {
          io: {
            rx_sec: totalRxSec,
            wx_sec: totalWxSec,
          },
        },
        battery: {
          hasBattery: battery.hasBattery,
          percent: battery.percent,
          isCharging: battery.isCharging,
          timeRemaining: battery.timeRemaining,
          cycleCount: battery.cycleCount,
        },
        bluetooth: bluetooth || [],
        fs: fsSize || [],
        timestamp: Date.now(),
      };
    } catch (e) {
      console.error('Monitoring tick failed', e);
      return null;
    }
  }

  async getPing(): Promise<{ latencyMs: number; jitterMs: number }> {
    return getPingLatency();
  }

  async getStaticInfo() {
    try {
      const [systemInfo, graphics, osInfo, cpu, mem, diskLayout] = await Promise.all([
        si.system(),
        si.graphics(),
        si.osInfo(),
        si.cpu(),
        si.mem(),
        si.diskLayout(),
      ]);

      const totalStorage = diskLayout.reduce((acc, d) => acc + d.size, 0);

      return {
        model: systemInfo.model,
        manufacturer: systemInfo.manufacturer,
        serial: systemInfo.serial,
        uuid: systemInfo.uuid,
        version: systemInfo.version,
        osVersion: osInfo.distro + ' ' + osInfo.release,
        kernel: osInfo.kernel,
        platform: osInfo.platform,
        cpuBrand: cpu.brand,
        cpuCores: cpu.cores,
        cpuPhysicalCores: cpu.physicalCores,
        totalRam: mem.total,
        totalStorage,
        displays: graphics.displays.map((d) => ({
          model: d.model,
          resolutionX: d.resolutionX,
          resolutionY: d.resolutionY,
          currentRefreshRate: d.currentRefreshRate,
          pixelDepth: d.pixelDepth,
        })),
        gpuControllers: graphics.controllers.map((c) => ({
          model: c.model,
          vram: c.vram,
          cores: (c as any).cores || null,
        })),
      };
    } catch (e) {
      console.error('Static info fetch failed', e);
      return null;
    }
  }

  async getHealth() {
    try {
      const diskLayout = await si.diskLayout();

      let smartInfo: any = null;
      try {
        if (typeof (si as any).smartCheck === 'function') {
          smartInfo = await (si as any).smartCheck();
        } else if (typeof (si as any).smart === 'function') {
          smartInfo = await (si as any).smart();
        }
      } catch (e) {
        console.warn('S.M.A.R.T check skipped or unsupported', e);
      }

      return {
        disks: diskLayout.map((d) => ({
          device: d.device,
          type: d.type,
          name: d.name,
          size: d.size,
          temperature: (d as any).temperature || null,
          powerOnHours: (d as any).powerOnHours || null,
          powerCycleCount: (d as any).powerCycleCount || null,
          smartStatus: smartInfo?.json?.hasOwnProperty(d.device)
            ? smartInfo.json[d.device].smart_status
            : 'Unknown',
        })),
      };
    } catch (e) {
      console.error('Health check failed', e);
      return null;
    }
  }
}

export const monitoringEngine = new MonitoringEngine();
