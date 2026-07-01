import { app, Tray, Menu, nativeImage, Notification, BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { windowManager } from './WindowManager';

let tray: Tray | null = null;
let trayPopup: BrowserWindow | null = null;

function createTrayPopup(preloadPath: string, devServerUrl?: string) {
  trayPopup = new BrowserWindow({
    width: 320,
    height: 460,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (devServerUrl) {
    trayPopup.loadURL(devServerUrl + '#/tray');
  } else {
    trayPopup.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/tray' });
  }

  trayPopup.on('blur', () => {
    trayPopup?.hide();
  });
}

function toggleTrayPopup() {
  if (!trayPopup || trayPopup.isDestroyed()) return;

  if (trayPopup.isVisible()) {
    trayPopup.hide();
    return;
  }

  // Position the popup below the tray icon
  const trayBounds = tray!.getBounds();
  const { workArea } = screen.getDisplayMatching(trayBounds);
  const popupWidth = trayPopup.getBounds().width;
  const popupHeight = trayPopup.getBounds().height;

  let x = Math.round(trayBounds.x + trayBounds.width / 2 - popupWidth / 2);
  let y = Math.round(trayBounds.y + trayBounds.height + 4);

  // Keep within screen bounds
  x = Math.max(workArea.x, Math.min(x, workArea.x + workArea.width - popupWidth));
  if (y + popupHeight > workArea.y + workArea.height) {
    // Show above tray icon if not enough space below
    y = trayBounds.y - popupHeight - 4;
  }

  trayPopup.setPosition(x, y, false);
  trayPopup.show();
  trayPopup.focus();
}

export function initializeTray(preloadPath?: string, devServerUrl?: string) {
  const iconPath = join(__dirname, '../../build/icon.png');
  let icon = nativeImage.createEmpty();
  try {
    icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } catch (e) {
    console.error('Tray icon not found', e);
  }

  tray = new Tray(icon);

  // Create the popup window
  if (preloadPath) {
    createTrayPopup(preloadPath, devServerUrl);
  }

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

  tray.setToolTip('DevDock — The Ultimate Developer Dashboard');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (trayPopup && !trayPopup.isDestroyed()) {
      toggleTrayPopup();
    } else {
      // Fallback: show main window
      windowManager.getMainWindow()?.show();
      windowManager.getMainWindow()?.focus();
    }
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
