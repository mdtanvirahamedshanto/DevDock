import { create } from 'zustand';

export interface TelemetryTick {
  cpu: { load: number; cores: number[] };
  mem: { total: number; used: number; percentage: number };
  network: { rx_sec: number; tx_sec: number };
  hardware: { temp: number; fanRpm: number; gpuLoad: number };
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
