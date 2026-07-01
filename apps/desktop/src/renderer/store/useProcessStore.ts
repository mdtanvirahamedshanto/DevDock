import { create } from 'zustand';
import type { ProcessData, ProcessAction } from '@devdock/processes';

interface ProcessStore {
  processes: ProcessData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchProcesses: () => Promise<void>;
  executeAction: (pid: number, action: ProcessAction) => Promise<boolean>;
}

export const useProcessStore = create<ProcessStore>((set) => ({
  processes: [],
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  fetchProcesses: async () => {
    try {
      const electronAPI = (window as any).electron;
      if (electronAPI) {
        const response = await electronAPI.invoke('processes:list');
        if (response.success) {
          set({ processes: response.data });
        }
      }
    } catch (e) {
      console.error('Failed to fetch processes', e);
    }
  },
  executeAction: async (pid: number, action: ProcessAction) => {
    try {
      const electronAPI = (window as any).electron;
      if (electronAPI) {
        const response = await electronAPI.invoke('processes:action', { pid, action });
        return response.success;
      }
      return false;
    } catch (e) {
      console.error(`Failed to execute ${action} on ${pid}`, e);
      return false;
    }
  },
}));
