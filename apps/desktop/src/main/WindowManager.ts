import { app, BrowserWindow, Rectangle } from 'electron';
import fs from 'fs';
import path from 'path';

interface WindowState {
  bounds: Rectangle;
  isMaximized: boolean;
}

export class WindowManager {
  private window: BrowserWindow | null = null;
  private stateFilePath: string;

  constructor() {
    this.stateFilePath = path.join(app.getPath('userData'), 'window-state.json');
  }

  private getSavedState(): WindowState | null {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const data = fs.readFileSync(this.stateFilePath, 'utf8');
        return JSON.parse(data) as WindowState;
      }
    } catch (e) {
      console.error('Failed to read window state', e);
    }
    return null;
  }

  private saveState(win: BrowserWindow) {
    if (!win.isDestroyed()) {
      const state: WindowState = {
        bounds: win.getBounds(),
        isMaximized: win.isMaximized(),
      };
      try {
        fs.writeFileSync(this.stateFilePath, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save window state', e);
      }
    }
  }

  public createMainWindow(
    preloadPath: string,
    renderPath: string,
    devServerUrl?: string,
  ): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      this.window.focus();
      return this.window;
    }

    const savedState = this.getSavedState();

    this.window = new BrowserWindow({
      x: savedState?.bounds?.x,
      y: savedState?.bounds?.y,
      width: savedState?.bounds?.width || 1200,
      height: savedState?.bounds?.height || 800,
      minWidth: 800,
      minHeight: 600,
      titleBarStyle: 'hiddenInset', // macOS optimized frameless look
      frame: process.platform === 'darwin' ? false : true, // Frameless on Mac, native on Windows for now (or custom frameless later)
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    if (savedState?.isMaximized) {
      this.window.maximize();
    }

    this.window.on('close', () => {
      this.saveState(this.window!);
    });

    if (devServerUrl) {
      this.window.loadURL(devServerUrl);
      this.window.webContents.openDevTools();
    } else {
      this.window.loadFile(renderPath);
    }

    return this.window;
  }
}

export const windowManager = new WindowManager();
