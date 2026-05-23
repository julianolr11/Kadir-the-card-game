/**
 * Audio Manager para Electron
 * Mantem a janela liberada para reproduzir audio e evita mute acidental.
 */

import { BrowserWindow } from 'electron';

export const setupAudioManager = (mainWindow: BrowserWindow) => {
  const keepAudioEnabled = () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.audioMuted = false;
    }
  };

  mainWindow.webContents.session.setPermissionCheckHandler(() => true);
  mainWindow.webContents.session.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      callback(true);
    },
  );

  mainWindow.webContents.on('will-navigate', keepAudioEnabled);
  mainWindow.webContents.on('dom-ready', keepAudioEnabled);
  mainWindow.webContents.on('did-finish-load', keepAudioEnabled);
  mainWindow.webContents.on('did-navigate', keepAudioEnabled);
  mainWindow.webContents.on('media-started-playing', keepAudioEnabled);
  mainWindow.on('show', keepAudioEnabled);
  mainWindow.on('focus', keepAudioEnabled);

  keepAudioEnabled();
};
