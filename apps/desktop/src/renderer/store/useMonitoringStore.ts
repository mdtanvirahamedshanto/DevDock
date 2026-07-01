import { create } from 'zustand';

export interface TelemetryTick {
  cpu: {
    load: number;
    system: number;
    user: number;
    idle: number;
    cores: { load: number; system: number; user: number; idle: number }[];
    brand: string;
    physicalCores: number;
    coresTotal: number;
    loadAvg1m: number;
    loadAvg5m: number;
    loadAvg15m: number;
    speeds: number[]; // GHz per core
    avgSpeedMhz: number;
    eCoreCount: number;
    pCoreCount: number;
  };
  mem: {
    total: number;
    used: number;
    free: number;
    swapTotal: number;
    swapUsed: number;
    percentage: number;
    wired: number;
    compressed: number;
    appMemory: number;
    pressureLevel: 'normal' | 'warning' | 'critical';
    buffers: number;
    cached: number;
  };
  network: {
    interfaces: any[];
    stats: any[];
    rx_sec: number;
    tx_sec: number;
    sessionRxBytes: number;
    sessionTxBytes: number;
    wifi: {
      ssid: string;
      bssid: string;
      channel: number;
      frequency: number;
      signalLevel: number;
      quality: number;
      security: string;
      protocol: string;
    } | null;
  };
  hardware: {
    temp: number;
    fanRpm: number;
    gpuLoad: number;
    controllers: any[];
    displays: any[];
    sensors: { label: string; temp: number }[];
  };
  disk: {
    io: {
      rx_sec: number;
      wx_sec: number;
    };
  };
  battery: {
    hasBattery: boolean;
    percent: number;
    isCharging: boolean;
    timeRemaining: number;
    cycleCount: number;
  };
  bluetooth: any[];
  fs: any[];
  timestamp: number;
}

export interface DiskHealth {
  device: string;
  type: string;
  name: string;
  size: number;
  smartStatus: string;
  temperature?: number | null;
  powerOnHours?: number | null;
  powerCycleCount?: number | null;
}

export interface StaticSystemInfo {
  model: string;
  manufacturer: string;
  serial: string;
  uuid: string;
  version: string;
  osVersion: string;
  kernel: string;
  platform: string;
  cpuBrand: string;
  cpuCores: number;
  cpuPhysicalCores: number;
  totalRam: number;
  totalStorage: number;
  displays: {
    model: string;
    resolutionX: number;
    resolutionY: number;
    currentRefreshRate: number;
    pixelDepth: number;
  }[];
  gpuControllers: {
    model: string;
    vram: number;
    cores: number | null;
  }[];
}

interface MonitoringStore {
  history: TelemetryTick[];
  disks: DiskHealth[];
  staticInfo: StaticSystemInfo | null;
  isMonitoring: boolean;
  pollingInterval: number;
  latencyMs: number;
  jitterMs: number;

  startMonitoring: () => void;
  stopMonitoring: () => void;
  fetchHealth: () => Promise<void>;
  fetchStaticInfo: () => Promise<void>;
  fetchPing: () => Promise<void>;
  setPollingInterval: (ms: number) => void;
}

export const useMonitoringStore = create<MonitoringStore>((set, get) => ({
  history: [],
  disks: [],
  staticInfo: null,
  isMonitoring: false,
  pollingInterval: 1000,
  latencyMs: -1,
  jitterMs: 0,

  startMonitoring: () => {
    if (get().isMonitoring) return;
    set({ isMonitoring: true });

    const electronAPI = (window as any).electron;
    if (!electronAPI) {
      console.warn('Electron API not available for monitoring:start');
      return;
    }
    electronAPI.send('monitoring:start');

    // Listen for ticks
    electronAPI.on('monitoring:tick', (tick: TelemetryTick) => {
      set((state) => {
        const newHistory = [...state.history, tick];
        // Keep last 60 ticks
        if (newHistory.length > 60) newHistory.shift();
        return { history: newHistory };
      });
    });
  },

  stopMonitoring: () => {
    if (!get().isMonitoring) return;
    set({ isMonitoring: false });

    const electronAPI = (window as any).electron;
    if (!electronAPI) {
      console.warn('Electron API not available for monitoring:stop');
      return;
    }
    electronAPI.send('monitoring:stop');
    electronAPI.removeAllListeners('monitoring:tick');
  },

  fetchHealth: async () => {
    try {
      const electronAPI = (window as any).electron;
      if (!electronAPI) return;
      const res = await electronAPI.invoke('monitoring:health');
      if (res && res.disks) {
        set({ disks: res.disks });
      }
    } catch (e) {
      console.error(e);
    }
  },

  fetchStaticInfo: async () => {
    try {
      const electronAPI = (window as any).electron;
      if (!electronAPI) return;
      const info = await electronAPI.invoke('monitoring:static');
      if (info) {
        set({ staticInfo: info });
      }
    } catch (e) {
      console.error(e);
    }
  },

  fetchPing: async () => {
    try {
      const electronAPI = (window as any).electron;
      if (!electronAPI) return;
      const result = await electronAPI.invoke('monitoring:ping');
      if (result) {
        set({ latencyMs: result.latencyMs, jitterMs: result.jitterMs });
      }
    } catch (e) {
      console.error(e);
    }
  },

  setPollingInterval: (ms: number) => {
    set({ pollingInterval: ms });
    const electronAPI = (window as any).electron;
    if (electronAPI) {
      electronAPI.send('monitoring:set-interval', ms);
    }
  },
}));
