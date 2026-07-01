import { create } from 'zustand';
import type { PortData } from '@devdock/ports';

interface PortHistoryEntry extends PortData {
  closedAt: string;
}

interface PortStore {
  activePorts: PortData[];
  history: PortHistoryEntry[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchPorts: () => Promise<void>;
  killPort: (pid: number, force?: boolean) => Promise<boolean>;
}

export const usePortStore = create<PortStore>((set, get) => ({
  activePorts: [],
  history: [],
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  fetchPorts: async () => {
    try {
      const electronAPI = (window as any).electron;
      if (electronAPI) {
        const response = await electronAPI.invoke('ports:list');
        if (response.success) {
          const newPorts: PortData[] = response.data;
          const currentPorts = get().activePorts;

          // Find closed ports to add to history
          const closed = currentPorts.filter((cp) => !newPorts.find((np) => np.port === cp.port));
          const newHistory = [...get().history];

          closed.forEach((c) => {
            newHistory.unshift({ ...c, closedAt: new Date().toISOString() });
          });

          // Limit history to last 50
          if (newHistory.length > 50) newHistory.length = 50;

          set({ activePorts: newPorts, history: newHistory });
        }
      }
    } catch (e) {
      console.error('Failed to fetch ports', e);
    }
  },
  killPort: async (pid: number, force = false) => {
    try {
      const electronAPI = (window as any).electron;
      if (electronAPI) {
        const response = await electronAPI.invoke('ports:kill', { pid, force });
        return response.success;
      }
      return false;
    } catch (e) {
      console.error(`Failed to kill port process ${pid}`, e);
      return false;
    }
  },
}));
