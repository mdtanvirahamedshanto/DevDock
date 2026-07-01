import si from 'systeminformation';

export class MonitoringEngine {
  async getTick() {
    try {
      const [cpuLoad, mem, networkStats] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.networkStats(),
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
