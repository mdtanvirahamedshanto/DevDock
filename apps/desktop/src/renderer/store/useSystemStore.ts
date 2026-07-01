import { create } from 'zustand';
import type { SystemMetrics } from '@devdock/system';

interface SystemStore {
  metrics: SystemMetrics | null;
  history: SystemMetrics[];
  startListening: () => void;
}

const MAX_HISTORY = 60; // Keep 60 data points for graphs

export const useSystemStore = create<SystemStore>((set) => {
  let isListening = false;

  return {
    metrics: null,
    history: [],
    startListening: () => {
      if (isListening) return;
      isListening = true;

      // Type cast window.electron to avoid TS errors
      const electronAPI = (window as any).electron;
      if (electronAPI && electronAPI.on) {
        electronAPI.on('system:metrics', (metrics: SystemMetrics) => {
          set((state) => {
            const newHistory = [...state.history, metrics];
            if (newHistory.length > MAX_HISTORY) {
              newHistory.shift();
            }
            return { metrics, history: newHistory };
          });
        });
      }
    },
  };
});
