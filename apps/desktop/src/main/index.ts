import { app, ipcMain, BrowserWindow, Menu, MenuItemConstructorOptions, dialog } from 'electron';
import { join } from 'path';
import { windowManager } from './WindowManager';
import { recoveryManager } from '@devdock/core';
import { getSystemMetrics } from '@devdock/system';
import { processService } from '@devdock/processes';
import { portService } from '@devdock/ports';
import { scanWorkspace, projectRunner, readEnvFile, writeEnvFile } from '@devdock/projects';
import { dbManager } from '@devdock/database';
import { dockerEngine } from '@devdock/docker';
import { gitEngine } from '@devdock/git';
import { fileScanner } from '@devdock/files';

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

ipcMain.handle('ports:list', async () => {
  try {
    const ports = await portService.getActivePorts();
    return { success: true, data: ports };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('ports:kill', async (_, { pid, force }) => {
  try {
    const result = force ? await portService.forceKillPort(pid) : await portService.killPort(pid);
    return { success: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// Projects IPC
ipcMain.handle('projects:scan', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return { success: false, error: 'No window found' };

  const { canceled, filePaths } = await dialog.showOpenDialog(window, {
    properties: ['openDirectory'],
  });

  if (canceled || filePaths.length === 0) {
    return { success: false, error: 'Cancelled' };
  }

  const workspace = await scanWorkspace(filePaths[0]);
  if (workspace) {
    return { success: true, data: workspace };
  }
  return { success: false, error: 'Failed to scan workspace' };
});

ipcMain.handle('projects:start', async (event, { id, path, framework }) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const success = await projectRunner.start(id, path, framework, (log) => {
    if (window && !window.isDestroyed()) {
      window.webContents.send('projects:log', { id, log });
    }
  });
  return { success };
});

ipcMain.handle('projects:stop', async (_, { id }) => {
  const success = await projectRunner.stop(id);
  return { success };
});

ipcMain.handle('projects:env:read', async (_, { path }) => {
  const env = await readEnvFile(path);
  return { success: true, data: env };
});

ipcMain.handle('projects:env:write', async (_, { path, env }) => {
  const success = await writeEnvFile(path, env);
  return { success };
});

// Database IPC
ipcMain.handle('db:connect', async (_, config) => {
  try {
    await dbManager.connect(config);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('db:disconnect', async (_, { id }) => {
  try {
    await dbManager.disconnect(id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('db:query', async (_, { id, sql }) => {
  try {
    const result = await dbManager.query(id, sql);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('db:tables', async (_, { id }) => {
  try {
    const tables = await dbManager.getTables(id);
    return { success: true, data: tables };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// Docker IPC
ipcMain.handle('docker:containers', async () => {
  return await dockerEngine.getContainers();
});
ipcMain.handle('docker:images', async () => {
  return await dockerEngine.getImages();
});
ipcMain.handle('docker:volumes', async () => {
  return await dockerEngine.getVolumes();
});
ipcMain.handle('docker:networks', async () => {
  return await dockerEngine.getNetworks();
});
ipcMain.handle('docker:action', async (_, { entity, action, id }) => {
  try {
    if (entity === 'container') {
      if (action === 'start') await dockerEngine.startContainer(id);
      if (action === 'stop') await dockerEngine.stopContainer(id);
      if (action === 'remove') await dockerEngine.removeContainer(id);
    } else if (entity === 'image' && action === 'remove') {
      await dockerEngine.removeImage(id);
    } else if (entity === 'volume' && action === 'remove') {
      await dockerEngine.removeVolume(id);
    } else if (entity === 'network' && action === 'remove') {
      await dockerEngine.removeNetwork(id);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// Git IPC
ipcMain.handle('git:status', async (_, { path }) => {
  return await gitEngine.status(path);
});

ipcMain.handle('git:branches', async (_, { path }) => {
  return await gitEngine.branches(path);
});

ipcMain.handle('git:commit', async (_, { path, message, files }) => {
  const success = await gitEngine.commit(path, message, files);
  return { success };
});

ipcMain.handle('git:pull', async (_, { path }) => {
  const success = await gitEngine.pull(path);
  return { success };
});

ipcMain.handle('git:push', async (_, { path }) => {
  const success = await gitEngine.push(path);
  return { success };
});

ipcMain.handle('git:stash', async (_, { path, message }) => {
  const success = await gitEngine.stash(path, message);
  return { success };
});

ipcMain.handle('git:checkout', async (_, { path, branch }) => {
  const success = await gitEngine.checkout(path, branch);
  return { success };
});

// Files IPC
ipcMain.handle('files:large', async (_, { path, minSizeMB }) => {
  return await fileScanner.findLargeFiles(path, minSizeMB);
});

ipcMain.handle('files:duplicates', async (_, { path }) => {
  return await fileScanner.findDuplicates(path);
});

ipcMain.handle('files:delete', async (_, { path }) => {
  const success = await fileScanner.deleteFile(path);
  return { success };
});
