import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { join } from 'path';
import crypto from 'crypto';
import { IpcResponse, ErrorModel } from '@devdock/ipc';

// --- Lifecycle Managers (Stubs for full implementation) ---
const bootSequence = async () => {
  console.log('[Boot] Initializing Config...');
  console.log('[Boot] Initializing Logger...');
  console.log('[Boot] Initializing Database...');
  console.log('[Boot] Initializing Settings...');
  console.log('[Boot] Initializing Plugin Loader...');
  console.log('[Boot] Initializing Native Services...');
};

const shutdownSequence = async () => {
  console.log('[Shutdown] Terminating Workers...');
  console.log('[Shutdown] Closing Terminals...');
  console.log('[Shutdown] Closing Database Connections...');
  console.log('[Shutdown] Flushing Logs...');
};

// --- Generic IPC Router Wrapper ---
const registerIpcHandler = <T>(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T>,
  timeoutMs: number = 5000
) => {
  ipcMain.handle(channel, async (event, ...args): Promise<IpcResponse<T>> => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`IPC timeout after ${timeoutMs}ms`)), timeoutMs);
      });

      // Race the handler against the timeout
      const data = await Promise.race([handler(event, ...args), timeoutPromise]);

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        requestId,
      };
    } catch (error: any) {
      console.error(`[IPC Error] ${channel} [${requestId}]:`, error);
      return {
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'An unknown error occurred.',
          // Only include stack in development
          ...(process.env.NODE_ENV !== 'production' && { details: { stack: error.stack } }),
        },
        timestamp: new Date().toISOString(),
        requestId,
      };
    }
  });
};

// --- Window Management ---
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  await bootSequence();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await shutdownSequence();
    app.quit();
  }
});

app.on('before-quit', async () => {
  await shutdownSequence();
});

// --- Register IPC Handlers using the Wrapper ---
registerIpcHandler('system:info', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    memoryTotal: process.getSystemMemoryInfo().total,
    memoryFree: process.getSystemMemoryInfo().free,
  };
}, 5000);
