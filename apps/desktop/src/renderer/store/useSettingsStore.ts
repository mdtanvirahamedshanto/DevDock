import { create } from 'zustand';
import { AppSettings, AppSettingsSchema } from '@devdock/settings';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  loadSettings: () => Promise<void>;
}

const defaultSettings = AppSettingsSchema.parse({});

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  updateSettings: async (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    // Optimistic UI update
    set({ settings: updated });
    // In production, this goes via IPC to save to SQLite:
    // await window.electron.invoke(SETTINGS_CHANNELS.UPDATE, updated);
  },
  loadSettings: async () => {
    try {
      // In production, fetch via IPC:
      // const data = await window.electron.invoke(SETTINGS_CHANNELS.GET_ALL);
      // set({ settings: data });
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  },
}));
