import { create } from 'zustand';
import { Theme } from '@devdock/settings';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  setTheme: (theme: Theme) => {
    // We would normally fire an IPC event here to persist it
    set({ theme });
  },
}));
