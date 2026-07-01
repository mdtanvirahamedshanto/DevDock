import { app, ipcMain, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { join } from 'path';
import { windowManager } from './WindowManager';
import { recoveryManager } from '@devdock/core';
import { getSystemMetrics } from '@devdock/system';
import { processService } from '@devdock/processes';

const bootSequence = async () => {
  console.log('[Boot] Initializing DevDock Native Core...');
  await recoveryManager.initialize();
  // Initialize other services here
};

const shutdownSequence = async () => {
  console.log('[Shutdown] Terminating DevDock Native Core...');
};

const setupNativeMenus = () => {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [isMac ? { role: 'close' as const } : { role: 'quit' as const }],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' as const },
              { role: 'delete' as const },
              { role: 'selectAll' as const },
              { type: 'separator' as const },
              {
                label: 'Speech',
                submenu: [{ role: 'startSpeaking' as const }, { role: 'stopSpeaking' as const }],
              },
            ]
          : [
              { role: 'delete' as const },
              { type: 'separator' as const },
              { role: 'selectAll' as const },
            ]),
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const },
              { type: 'separator' as const },
              { role: 'window' as const },
            ]
          : [{ role: 'close' as const }]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

app.whenReady().then(async () => {
  await bootSequence();
  setupNativeMenus();

  const mainWindow = windowManager.createMainWindow(
    join(__dirname, '../preload/index.js'),
    join(__dirname, '../renderer/index.html'),
    process.env.VITE_DEV_SERVER_URL,
  );

  // Broadcast system metrics every 2 seconds
  setInterval(async () => {
    try {
      const metrics = await getSystemMetrics();
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('system:metrics', metrics);
      }
    } catch (err) {
      console.error('Failed to broadcast metrics', err);
    }
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createMainWindow(
        join(__dirname, '../preload/index.js'),
        join(__dirname, '../renderer/index.html'),
        process.env.VITE_DEV_SERVER_URL,
      );
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

// IPC Example
ipcMain.handle('system:info', async () => {
  return {
    success: true,
    data: { platform: process.platform },
    timestamp: new Date().toISOString(),
    requestId: '123',
  };
});

ipcMain.handle('processes:list', async () => {
  try {
    const processes = await processService.getProcesses();
    return { success: true, data: processes };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('processes:action', async (_, { pid, action }) => {
  try {
    const result = await processService.executeAction(pid, action);
    return { success: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});
