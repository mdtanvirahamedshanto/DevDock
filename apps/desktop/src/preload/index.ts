import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@devdock/ipc';

export const electronAPI = {
  send: (channel: string, ...args: any[]) => {
    if (channel.startsWith('monitoring:') || channel.startsWith('terminal:')) {
      ipcRenderer.send(channel, ...args);
    } else {
      throw new Error(`Unauthorized IPC channel send: ${channel}`);
    }
  },
  invoke: (channel: string, ...args: any[]) => {
    const validChannels = Object.values(IPC_CHANNELS);
    if (
      validChannels.includes(channel as any) ||
      channel.startsWith('monitoring:') ||
      channel.startsWith('terminal:')
    ) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Unauthorized IPC channel: ${channel}`);
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    if (
      channel === 'system:metrics' ||
      channel === 'projects:log' ||
      channel.startsWith('monitoring:') ||
      channel.startsWith('terminal:')
    ) {
      const subscription = (_event: any, ...args: any[]) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    throw new Error(`Unauthorized IPC channel listener: ${channel}`);
  },
  removeAllListeners: (channel: string) => {
    if (channel.startsWith('monitoring:') || channel.startsWith('terminal:')) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
};

contextBridge.exposeInMainWorld('electron', electronAPI);
