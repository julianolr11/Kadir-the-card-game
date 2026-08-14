import { BrowserWindow, ipcMain, screen } from 'electron';

type DisplaySettings = {
  width: number;
  height: number;
  fullscreen: boolean;
};

const waitForWindowEvent = (
  window: BrowserWindow,
  eventName: 'enter-full-screen' | 'leave-full-screen',
) =>
  new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, 1500);
    window.once(eventName, () => {
      clearTimeout(timeout);
      resolve();
    });
  });

const getWindowedBounds = (
  mainWindow: BrowserWindow,
  width: number,
  height: number,
) => {
  const display = screen.getDisplayMatching(mainWindow.getBounds());
  const { workArea } = display;
  const requestedRatio = width / height;
  // BrowserWindow usa DIP; as opções são apresentadas em pixels físicos.
  const scaleFactor = Math.max(1, display.scaleFactor || 1);
  const requestedWidthDip = Math.round(width / scaleFactor);

  let safeWidth = Math.min(Math.max(640, requestedWidthDip), workArea.width);
  let safeHeight = Math.round(safeWidth / requestedRatio);

  if (safeHeight > workArea.height) {
    safeHeight = workArea.height;
    safeWidth = Math.round(safeHeight * requestedRatio);
  }

  return {
    x: workArea.x + Math.round((workArea.width - safeWidth) / 2),
    y: workArea.y + Math.round((workArea.height - safeHeight) / 2),
    width: safeWidth,
    height: safeHeight,
  };
};

export default function setupResolutionIPC(mainWindow: BrowserWindow) {
  const notifyDisplayState = () => {
    if (mainWindow.isDestroyed()) return;
    const [width, height] = mainWindow.getContentSize();
    mainWindow.webContents.send('display-state-changed', {
      fullscreen: mainWindow.isFullScreen(),
      width,
      height,
    });
  };

  const applyDisplaySettings = async ({
    width,
    height,
    fullscreen,
  }: DisplaySettings) => {
    const safeWidth = Number.isFinite(width) ? width : 1280;
    const safeHeight = Number.isFinite(height) ? height : 720;

    if (fullscreen) {
      mainWindow.setAspectRatio(0);
      if (!mainWindow.isFullScreen()) {
        const entered = waitForWindowEvent(mainWindow, 'enter-full-screen');
        mainWindow.setFullScreen(true);
        await entered;
      }
    } else {
      if (mainWindow.isFullScreen()) {
        const left = waitForWindowEvent(mainWindow, 'leave-full-screen');
        mainWindow.setFullScreen(false);
        await left;
      }
      mainWindow.setAspectRatio(safeWidth / safeHeight);
      mainWindow.setBounds(
        getWindowedBounds(mainWindow, safeWidth, safeHeight),
        true,
      );
    }

    // O renderer cuida da escala do palco; o zoom nativo deve permanecer neutro.
    mainWindow.webContents.setZoomFactor(1);
    notifyDisplayState();
    const [appliedWidth, appliedHeight] = mainWindow.getContentSize();
    return {
      fullscreen: mainWindow.isFullScreen(),
      width: appliedWidth,
      height: appliedHeight,
    };
  };

  ipcMain.handle(
    'apply-display-settings',
    (_event, settings: DisplaySettings) => applyDisplaySettings(settings),
  );

  // Compatibilidade com versões antigas do renderer durante hot reload.
  ipcMain.on('set-resolution', (_event, settings: DisplaySettings) => {
    applyDisplaySettings(settings).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('[IPC] Error applying display settings:', error);
    });
  });

  mainWindow.on('enter-full-screen', notifyDisplayState);
  mainWindow.on('leave-full-screen', notifyDisplayState);
  mainWindow.on('resize', notifyDisplayState);
}
