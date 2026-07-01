import { create } from 'zustand';

interface DockerStore {
  containers: any[];
  images: any[];
  volumes: any[];
  networks: any[];
  fetchData: () => Promise<void>;
  executeAction: (entity: string, action: string, id: string) => Promise<boolean>;
}

export const useDockerStore = create<DockerStore>((set, get) => ({
  containers: [],
  images: [],
  volumes: [],
  networks: [],

  fetchData: async () => {
    try {
      const electronAPI = (window as any).electron;
      if (!electronAPI) return;

      const [containers, images, volumes, networks] = await Promise.all([
        electronAPI.invoke('docker:containers'),
        electronAPI.invoke('docker:images'),
        electronAPI.invoke('docker:volumes'),
        electronAPI.invoke('docker:networks'),
      ]);

      set({
        containers: containers || [],
        images: images || [],
        volumes: volumes || [],
        networks: networks || [],
      });
    } catch (e) {
      console.error('Failed to fetch Docker data', e);
    }
  },

  executeAction: async (entity, action, id) => {
    try {
      const electronAPI = (window as any).electron;
      const res = await electronAPI.invoke('docker:action', { entity, action, id });
      if (res.success) {
        await get().fetchData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(`Docker action failed: ${action} on ${entity} ${id}`, e);
      return false;
    }
  },
}));
