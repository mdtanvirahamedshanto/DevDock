import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@devdock/ipc';

export const electronAPI = {
  invoke: (channel: string, ...args: any[]) => {
    const validChannels = Object.values(IPC_CHANNELS);
    if (validChannels.includes(channel as any)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Unauthorized IPC channel: ${channel}`);
  },
};

contextBridge.exposeInMainWorld('electron', electronAPI);
