// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'ipc-example'
  | 'set-resolution'
  | 'display-state-changed';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    applyDisplaySettings: (settings: {
      width: number;
      height: number;
      fullscreen: boolean;
    }) => ipcRenderer.invoke('apply-display-settings', settings),
    onDisplayStateChanged: (
      cb: (state: {
        width: number;
        height: number;
        fullscreen: boolean;
      }) => void,
    ) => {
      const subscription = (
        _event: IpcRendererEvent,
        state: {
          width: number;
          height: number;
          fullscreen: boolean;
        },
      ) => cb(state);
      ipcRenderer.on('display-state-changed', subscription);
      return () =>
        ipcRenderer.removeListener('display-state-changed', subscription);
    },
    // --- Update helpers ---
    checkForUpdate: () => ipcRenderer.invoke('update-check'),
    downloadUpdate: () => ipcRenderer.invoke('update-download'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    onUpdateProgress: (cb: (progress: any) => void) => {
      ipcRenderer.on('update-download-progress', (_event, progress) =>
        cb(progress),
      );
    },
    onUpdateDownloaded: (cb: (info: any) => void) => {
      ipcRenderer.on('update-downloaded', (_event, info) => cb(info));
    },
    onUpdateError: (cb: (err: any) => void) => {
      ipcRenderer.on('update-error', (_event, err) => cb(err));
    },
    // --- Steam helpers ---
    getSteamStatus: () => ipcRenderer.invoke('steam-get-status'),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
