import { create } from 'zustand';

export interface TerminalTab {
  id: string;
  title: string;
  type: 'local' | 'ssh' | 'serial';
  ptyId?: string; // The ID from node-pty
}

interface TerminalStore {
  tabs: TerminalTab[];
  activeTabId: string | null;

  addTab: (type: 'local' | 'ssh' | 'serial', cwd?: string) => Promise<void>;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: async (type, cwd) => {
    const id = Math.random().toString(36).substring(7);
    const title =
      type === 'local' ? 'Local Terminal' : type === 'ssh' ? 'SSH Session' : 'Serial Console';

    let ptyId: string | undefined = undefined;
    if (type === 'local') {
      const electronAPI = (window as any).electron;
      const res = await electronAPI.invoke('terminal:spawn', { cwd });
      ptyId = res.id;
    }

    set((state) => ({
      tabs: [...state.tabs, { id, title, type, ptyId }],
      activeTabId: id,
    }));
  },

  closeTab: (id) => {
    set((state) => {
      const tab = state.tabs.find((t) => t.id === id);
      if (tab?.ptyId) {
        (window as any).electron.send('terminal:kill', { id: tab.ptyId });
      }

      const newTabs = state.tabs.filter((t) => t.id !== id);
      return {
        tabs: newTabs,
        activeTabId:
          state.activeTabId === id ? newTabs[newTabs.length - 1]?.id || null : state.activeTabId,
      };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),
}));
