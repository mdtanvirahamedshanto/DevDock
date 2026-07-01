import si from 'systeminformation';

export interface SystemMetrics {
  cpu: {
    manufacturer: string;
    brand: string;
    speed: number;
    cores: number;
    currentLoad: number;
    temperature: number;
  };
  mem: {
    total: number;
    free: number;
    used: number;
    active: number;
  };
  storage: {
    total: number;
    used: number;
    free: number;
  }[];
  network: {
    iface: string;
    rx_sec: number;
    tx_sec: number;
  }[];
  battery: {
    hasBattery: boolean;
    isCharging: boolean;
    percent: number;
  };
  gpu: {
    controllers: {
      vendor: string;
      model: string;
      vram: number;
      utilizationGpu?: number;
    }[];
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
  };
}

export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const [cpu, cpuLoad, cpuTemp, mem, fsSize, networkStats, battery, graphics, osInfo] =
    await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.cpuTemperature(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.battery(),
      si.graphics(),
      si.osInfo(),
    ]);

  return {
    cpu: {
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      speed: cpu.speed,
      cores: cpu.cores,
      currentLoad: cpuLoad.currentLoad,
      temperature: cpuTemp.main || 0,
    },
    mem: {
      total: mem.total,
      free: mem.free,
      used: mem.used,
      active: mem.active,
    },
    storage: fsSize.map((fs) => ({
      total: fs.size,
      used: fs.used,
      free: fs.size - fs.used,
    })),
    network: networkStats.map((net) => ({
      iface: net.iface,
      rx_sec: net.rx_sec,
      tx_sec: net.tx_sec,
    })),
    battery: {
      hasBattery: battery.hasBattery,
      isCharging: battery.isCharging,
      percent: battery.percent,
    },
    gpu: {
      controllers: graphics.controllers.map((gpu) => ({
        vendor: gpu.vendor,
        model: gpu.model,
        vram: gpu.vram,
        utilizationGpu: gpu.utilizationGpu,
      })),
    },
    os: {
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      arch: osInfo.arch,
    },
  };
};
