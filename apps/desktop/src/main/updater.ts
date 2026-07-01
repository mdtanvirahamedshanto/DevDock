import { autoUpdater } from 'electron-updater';
import { ipcMain } from 'electron';
import { windowManager } from './WindowManager';

export function initializeUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    windowManager.getMainWindow()?.webContents.send('update-status', { status: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    windowManager.getMainWindow()?.webContents.send('update-status', { status: 'available', info });
  });

  autoUpdater.on('update-not-available', () => {
    windowManager.getMainWindow()?.webContents.send('update-status', { status: 'not-available' });
  });

  autoUpdater.on('error', (err) => {
    windowManager
      .getMainWindow()
      ?.webContents.send('update-status', { status: 'error', error: err.message });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    windowManager.getMainWindow()?.webContents.send('update-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', () => {
    windowManager.getMainWindow()?.webContents.send('update-status', { status: 'downloaded' });
    // Tell the UI they can install it
  });

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
  });

  // Check on boot
  autoUpdater.checkForUpdatesAndNotify();
}
