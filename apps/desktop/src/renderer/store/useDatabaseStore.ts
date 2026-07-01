import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DbConnectionConfig, DbQueryResult, DatabaseEngine } from '@devdock/database';

interface SavedConnection extends DbConnectionConfig {
  id: string;
}

interface DatabaseStore {
  savedConnections: SavedConnection[];
  activeConnectionId: string | null;
  activeTables: string[];
  queryResults: DbQueryResult | null;
  queryError: string | null;
  queryHistory: string[];

  saveConnection: (config: Omit<SavedConnection, 'id'>) => void;
  removeConnection: (id: string) => void;
  connect: (id: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  executeQuery: (sql: string) => Promise<void>;
  fetchTables: () => Promise<void>;
}

export const useDatabaseStore = create<DatabaseStore>()(
  persist(
    (set, get) => ({
      savedConnections: [],
      activeConnectionId: null,
      activeTables: [],
      queryResults: null,
      queryError: null,
      queryHistory: [],

      saveConnection: (config) => {
        const id = crypto.randomUUID();
        set((state) => ({
          savedConnections: [...state.savedConnections, { ...config, id }],
        }));
      },
      removeConnection: (id) => {
        set((state) => ({
          savedConnections: state.savedConnections.filter((c) => c.id !== id),
        }));
      },
      connect: async (id) => {
        const conn = get().savedConnections.find((c) => c.id === id);
        if (!conn) return false;

        try {
          const electronAPI = (window as any).electron;
          const res = await electronAPI.invoke('db:connect', conn);
          if (res.success) {
            set({ activeConnectionId: id, queryResults: null, queryError: null, activeTables: [] });
            await get().fetchTables();
            return true;
          } else {
            set({ queryError: res.error });
            return false;
          }
        } catch (e: any) {
          set({ queryError: e.message });
          return false;
        }
      },
      disconnect: async () => {
        const id = get().activeConnectionId;
        if (!id) return;

        const electronAPI = (window as any).electron;
        await electronAPI.invoke('db:disconnect', { id });
        set({ activeConnectionId: null, queryResults: null, activeTables: [] });
      },
      executeQuery: async (sql) => {
        const id = get().activeConnectionId;
        if (!id) return;

        set({ queryError: null, queryResults: null });

        try {
          const electronAPI = (window as any).electron;
          const res = await electronAPI.invoke('db:query', { id, sql });

          if (res.success) {
            set((state) => ({
              queryResults: res.data,
              queryHistory: [sql, ...state.queryHistory].slice(0, 100),
            }));
          } else {
            set({ queryError: res.error });
          }
        } catch (e: any) {
          set({ queryError: e.message });
        }
      },
      fetchTables: async () => {
        const id = get().activeConnectionId;
        if (!id) return;

        try {
          const electronAPI = (window as any).electron;
          const res = await electronAPI.invoke('db:tables', { id });
          if (res.success) {
            set({ activeTables: res.data });
          }
        } catch (e) {
          console.error('Failed to fetch tables', e);
        }
      },
    }),
    {
      name: 'devdock-database-storage',
      partialize: (state) => ({
        savedConnections: state.savedConnections,
        queryHistory: state.queryHistory,
      }),
    },
  ),
);
