import { ipcMain } from 'electron';

export function setupResolutionIPC(mainWindow) {
  ipcMain.on('set-resolution', (event, { width, height, fullscreen }) => {
    console.log('[IPC] set-resolution received:', { width, height, fullscreen });
    try {
      if (fullscreen) {
        console.log('[IPC] Setting fullscreen: true');
        mainWindow.setFullScreen(true);
      } else {
        console.log('[IPC] Setting fullscreen: false, size:', { width, height });
        mainWindow.setFullScreen(false);
        mainWindow.setSize(width, height);
        mainWindow.center();
      }
      console.log('[IPC] Resolution/Fullscreen applied successfully');
    } catch (err) {
      console.error('[IPC] Error applying resolution:', err);
    }
  });
}

