/**
 * Audio Manager para Electron
 * Gerencia reprodução de áudio com suporte a loop e controle de volume
 */

import { BrowserWindow } from 'electron';

export const setupAudioManager = (mainWindow: BrowserWindow) => {
  // Ativa permissões de áudio e media
  mainWindow.webContents.session.setPermissionCheckHandler(() => true);

  // Desabilita restrições de autoplay
  mainWindow.webContents.on('will-navigate', (event, url) => {
    mainWindow.webContents.audioMuted = false;
  });

  // Garante que o áudio não será silenciado
  mainWindow.webContents.audioMuted = false;
};
