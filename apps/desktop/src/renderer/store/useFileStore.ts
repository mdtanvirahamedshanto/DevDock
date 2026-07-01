import { create } from 'zustand';
import type { FileInfo } from '@devdock/files';

interface FileStore {
  targetPath: string | null;
  largeFiles: FileInfo[];
  duplicates: FileInfo[][];
  isScanning: boolean;

  setTargetPath: (path: string) => void;
  scanLargeFiles: (minSizeMB?: number) => Promise<void>;
  scanDuplicates: () => Promise<void>;
  deleteFile: (path: string) => Promise<boolean>;
}

export const useFileStore = create<FileStore>((set, get) => ({
  targetPath: null,
  largeFiles: [],
  duplicates: [],
  isScanning: false,

  setTargetPath: (path) => set({ targetPath: path, largeFiles: [], duplicates: [] }),

  scanLargeFiles: async (minSizeMB = 10) => {
    const { targetPath } = get();
    if (!targetPath) return;

    set({ isScanning: true });
    try {
      const electronAPI = (window as any).electron;
      const res = await electronAPI.invoke('files:large', { path: targetPath, minSizeMB });
      set({ largeFiles: res });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isScanning: false });
    }
  },

  scanDuplicates: async () => {
    const { targetPath } = get();
    if (!targetPath) return;

    set({ isScanning: true });
    try {
      const electronAPI = (window as any).electron;
      const res = await electronAPI.invoke('files:duplicates', { path: targetPath });
      set({ duplicates: res });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isScanning: false });
    }
  },

  deleteFile: async (path) => {
    try {
      const electronAPI = (window as any).electron;
      const res = await electronAPI.invoke('files:delete', { path });

      if (res.success) {
        // Optimistically remove from state
        set((state) => ({
          largeFiles: state.largeFiles.filter((f) => f.path !== path),
          duplicates: state.duplicates
            .map((group) => group.filter((f) => f.path !== path))
            .filter((group) => group.length > 1),
        }));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
}));
