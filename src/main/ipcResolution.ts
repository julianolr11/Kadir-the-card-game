import { ipcMain } from 'electron';

export function setupResolutionIPC(mainWindow) {
  ipcMain.on('set-resolution', (event, { width, height, fullscreen }) => {
    if (fullscreen) {
      mainWindow.setFullScreen(true);
    } else {
      mainWindow.setFullScreen(false);
      mainWindow.setSize(width, height);
      mainWindow.center();
    }
  });
}
