import si from 'systeminformation';

export class MonitoringEngine {
  async getTick() {
    try {
      const [cpuLoad, mem, networkStats, temp, graphics] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.networkStats(),
        si.cpuTemperature(),
        si.graphics(),
      ]);

      return {
        cpu: {
          load: cpuLoad.currentLoad,
          cores: cpuLoad.cpus.map((c) => c.load),
        },
        mem: {
          total: mem.total,
          used: mem.active,
          percentage: (mem.active / mem.total) * 100,
        },
        network: {
          rx_sec: networkStats[0]?.rx_sec || 0,
          tx_sec: networkStats[0]?.tx_sec || 0,
        },
        hardware: {
          temp: temp.main || 0,
          fanRpm: temp.max || 0, // Using max temp as fallback if fan isn't provided directly, some systems map it here
          gpuLoad: graphics.controllers[0]?.memoryUsed
            ? (graphics.controllers[0].memoryUsed / graphics.controllers[0].memoryTotal) * 100
            : 0,
        },
        timestamp: Date.now(),
      };
    } catch (e) {
      console.error('Monitoring tick failed', e);
      return null;
    }
  }

  async getHealth() {
    try {
      const [diskLayout, smart] = await Promise.all([si.diskLayout(), si.smart()]);

      return {
        disks: diskLayout.map((d) => ({
          device: d.device,
          type: d.type,
          name: d.name,
          size: d.size,
          smartStatus: smart?.json?.hasOwnProperty(d.device)
            ? smart.json[d.device].smart_status
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
