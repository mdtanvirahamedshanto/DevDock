import { app, Tray, Menu, nativeImage, Notification } from 'electron';
import { join } from 'path';
import { windowManager } from './WindowManager';

let tray: Tray | null = null;

export function initializeTray() {
  const iconPath = join(__dirname, '../../build/icon.png');
  let icon = nativeImage.createEmpty();
  try {
    icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } catch (e) {
    console.error('Tray icon not found', e);
  }

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open DevDock',
      click: () => {
        windowManager.getMainWindow()?.show();
        windowManager.getMainWindow()?.focus();
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setToolTip('DevDock - The Ultimate Developer Dashboard');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    windowManager.getMainWindow()?.show();
    windowManager.getMainWindow()?.focus();
  });
}

export function showNotification(title: string, body: string) {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: join(__dirname, '../../build/icon.png'),
    }).show();
  }
}

export function setupAutoStart() {
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
  });
}
