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
  };
  mem: {
    total: number;
    used: number;
    free: number;
    swapTotal: number;
    swapUsed: number;
    percentage: number;
  };
  network: {
    interfaces: any[];
    stats: any[];
    rx_sec: number;
    tx_sec: number;
  };
  hardware: {
    temp: number;
    fanRpm: number;
    gpuLoad: number;
    controllers: any[];
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
}

interface MonitoringStore {
  history: TelemetryTick[];
  disks: DiskHealth[];
  isMonitoring: boolean;

  startMonitoring: () => void;
  stopMonitoring: () => void;
  fetchHealth: () => Promise<void>;
}

export const useMonitoringStore = create<MonitoringStore>((set, get) => ({
  history: [],
  disks: [],
  isMonitoring: false,

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
        // Keep last 60 seconds
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
      if (!electronAPI) {
        console.warn('Electron API not available for monitoring:health');
        return;
      }
      const res = await electronAPI.invoke('monitoring:health');
      if (res && res.disks) {
        set({ disks: res.disks });
      }
    } catch (e) {
      console.error(e);
    }
  },
}));
