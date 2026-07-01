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
  on: (channel: string, callback: (...args: any[]) => void) => {
    if (channel === 'system:metrics') {
      const subscription = (_event: any, ...args: any[]) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    throw new Error(`Unauthorized IPC channel listener: ${channel}`);
  },
};

contextBridge.exposeInMainWorld('electron', electronAPI);
