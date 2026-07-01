import si from 'systeminformation';

export class MonitoringEngine {
  async getTick() {
    try {
      const [
        cpu,
        cpuLoad,
        mem,
        networkStats,
        networkInterfaces,
        temp,
        graphics,
        battery,
        bluetooth,
        fsSize,
      ] = await Promise.all([
        si.cpu(),
        si.currentLoad(),
        si.mem(),
        si.networkStats(),
        si.networkInterfaces(),
        si.cpuTemperature(),
        si.graphics(),
        si.battery(),
        si.bluetoothDevices(),
        si.fsSize(),
      ]);

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
        },
        mem: {
          total: mem.total,
          used: mem.active,
          free: mem.free,
          swapTotal: mem.swaptotal,
          swapUsed: mem.swapused,
          percentage: (mem.active / mem.total) * 100,
        },
        network: {
          interfaces: Array.isArray(networkInterfaces) ? networkInterfaces : [networkInterfaces],
          stats: Array.isArray(networkStats) ? networkStats : [networkStats],
          rx_sec: networkStats[0]?.rx_sec || 0,
          tx_sec: networkStats[0]?.tx_sec || 0,
        },
        hardware: {
          temp: temp.main || 0,
          fanRpm: temp.max || 0,
          gpuLoad: graphics.controllers[0]?.memoryUsed
            ? (graphics.controllers[0].memoryUsed / graphics.controllers[0].memoryTotal) * 100
            : 0,
          controllers: graphics.controllers,
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

  async getHealth() {
    try {
      const diskLayout = await si.diskLayout();

      // smartCheck is not consistently available across OSes or versions
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
