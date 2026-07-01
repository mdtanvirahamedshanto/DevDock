import { create } from 'zustand';

interface GitStore {
  targetPath: string | null;
  status: any | null;
  branches: any | null;

  setTargetPath: (path: string) => void;
  fetchData: () => Promise<void>;
  commit: (message: string, files: string[]) => Promise<boolean>;
  pull: () => Promise<boolean>;
  push: () => Promise<boolean>;
  stash: (message?: string) => Promise<boolean>;
  checkout: (branch: string) => Promise<boolean>;
}

export const useGitStore = create<GitStore>((set, get) => ({
  targetPath: null,
  status: null,
  branches: null,

  setTargetPath: (path) => {
    set({ targetPath: path, status: null, branches: null });
    get().fetchData();
  },

  fetchData: async () => {
    const { targetPath } = get();
    if (!targetPath) return;

    try {
      const electronAPI = (window as any).electron;
      const [status, branches] = await Promise.all([
        electronAPI.invoke('git:status', { path: targetPath }),
        electronAPI.invoke('git:branches', { path: targetPath }),
      ]);

      set({ status, branches });
    } catch (e) {
      console.error('Failed to fetch Git data', e);
    }
  },

  commit: async (message, files) => {
    const { targetPath } = get();
    if (!targetPath) return false;
    const res = await (window as any).electron.invoke('git:commit', {
      path: targetPath,
      message,
      files,
    });
    if (res.success) await get().fetchData();
    return res.success;
  },

  pull: async () => {
    const { targetPath } = get();
    if (!targetPath) return false;
    const res = await (window as any).electron.invoke('git:pull', { path: targetPath });
    if (res.success) await get().fetchData();
    return res.success;
  },

  push: async () => {
    const { targetPath } = get();
    if (!targetPath) return false;
    const res = await (window as any).electron.invoke('git:push', { path: targetPath });
    if (res.success) await get().fetchData();
    return res.success;
  },

  stash: async (message) => {
    const { targetPath } = get();
    if (!targetPath) return false;
    const res = await (window as any).electron.invoke('git:stash', { path: targetPath, message });
    if (res.success) await get().fetchData();
    return res.success;
  },

  checkout: async (branch) => {
    const { targetPath } = get();
    if (!targetPath) return false;
    const res = await (window as any).electron.invoke('git:checkout', { path: targetPath, branch });
    if (res.success) await get().fetchData();
    return res.success;
  },
}));
