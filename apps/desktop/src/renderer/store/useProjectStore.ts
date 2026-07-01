import { create } from 'zustand';
import type { ProjectWorkspace } from '@devdock/projects';

interface ProjectState extends ProjectWorkspace {
  status: 'stopped' | 'running' | 'error';
  logs: string[];
}

interface ProjectStore {
  projects: Record<string, ProjectState>;
  addProject: () => Promise<void>;
  startProject: (id: string) => Promise<void>;
  stopProject: (id: string) => Promise<void>;
  restartProject: (id: string) => Promise<void>;
  clearLogs: (id: string) => void;
  removeProject: (id: string) => void;
  setupLogListener: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: {},
  addProject: async () => {
    try {
      const electronAPI = (window as any).electron;
      if (!electronAPI) return;

      const response = await electronAPI.invoke('projects:scan');
      if (response.success && response.data) {
        const workspace: ProjectWorkspace = response.data;
        set((state) => ({
          projects: {
            ...state.projects,
            [workspace.id]: {
              ...workspace,
              status: 'stopped',
              logs: [],
            },
          },
        }));
      }
    } catch (e) {
      console.error('Failed to add project', e);
    }
  },
  startProject: async (id: string) => {
    try {
      const state = get().projects[id];
      if (!state || state.status === 'running') return;

      set((s) => ({
        projects: { ...s.projects, [id]: { ...s.projects[id], status: 'running' } },
      }));

      const electronAPI = (window as any).electron;
      const res = await electronAPI.invoke('projects:start', {
        id,
        path: state.path,
        framework: state.framework,
      });
      if (!res.success) {
        set((s) => ({
          projects: { ...s.projects, [id]: { ...s.projects[id], status: 'error' } },
        }));
      }
    } catch (e) {
      console.error(e);
    }
  },
  stopProject: async (id: string) => {
    try {
      const electronAPI = (window as any).electron;
      await electronAPI.invoke('projects:stop', { id });
      set((s) => ({
        projects: { ...s.projects, [id]: { ...s.projects[id], status: 'stopped' } },
      }));
    } catch (e) {
      console.error(e);
    }
  },
  restartProject: async (id: string) => {
    await get().stopProject(id);
    // Small delay before start
    setTimeout(() => get().startProject(id), 1000);
  },
  clearLogs: (id: string) => {
    set((s) => ({
      projects: { ...s.projects, [id]: { ...s.projects[id], logs: [] } },
    }));
  },
  removeProject: (id: string) => {
    const { [id]: _, ...rest } = get().projects;
    set({ projects: rest });
  },
  setupLogListener: () => {
    const electronAPI = (window as any).electron;
    if (electronAPI && electronAPI.on) {
      electronAPI.on('projects:log', (data: { id: string; log: string }) => {
        set((state) => {
          const proj = state.projects[data.id];
          if (!proj) return state;

          const newLogs = [...proj.logs, data.log];
          // Keep last 500 lines max
          if (newLogs.length > 500) newLogs.splice(0, newLogs.length - 500);

          return {
            projects: {
              ...state.projects,
              [data.id]: {
                ...proj,
                logs: newLogs,
              },
            },
          };
        });
      });
    }
  },
}));
