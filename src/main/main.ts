/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { setupResolutionIPC } from './ipcResolution';
import { setupAudioManager } from './audioManager';

// Novo fluxo: inicialização do autoUpdater será feita sob demanda via IPC
log.transports.file.level = 'info';
autoUpdater.logger = log;

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  // Caminho do novo ícone
  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // Ícone customizado para Windows
  const iconPath = path.join(
    __dirname,
    '../../src/assets/img/icons/iconlive.png',
  );

  mainWindow = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    resizable: true,
    frame: false, // Remove barra de ferramentas e botões
    icon: iconPath,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
    },
  });

  setupResolutionIPC(mainWindow);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  // Permitir autoplay de áudio
  mainWindow.webContents.session.setPermissionCheckHandler(() => true);
  setupAudioManager(mainWindow);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Remove barra de menu padrão
  // Menu.setApplicationMenu(null);

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Configurar autoUpdater
  autoUpdater.autoDownload = false; // Não baixar automaticamente, só quando usuário clicar
  autoUpdater.autoInstallOnAppQuit = true; // Instalar ao sair do app
  log.info('AutoUpdater configurado');

  // O update será iniciado manualmente via IPC do renderer
  // IPC handlers para update
  ipcMain.handle('update-check', async () => {
    try {
      log.info('IPC: Checking for updates...');
      const result = await autoUpdater.checkForUpdates();
      log.info('Check result:', result);
      if (result && result.updateInfo && result.updateInfo.version !== app.getVersion()) {
        log.info(`Update available: ${result.updateInfo.version} (current: ${app.getVersion()})`);
        return { updateAvailable: true, info: result.updateInfo };
      }
      log.info('No update available');
      return { updateAvailable: false };
    } catch (err: any) {
      log.error('Update check error:', err);
      return { updateAvailable: false, error: err?.message || 'Update check failed' };
    }
  });

  ipcMain.handle('update-download', async () => {
    try {
      log.info('Iniciando download da atualização...');
      await autoUpdater.downloadUpdate();
      log.info('Download iniciado com sucesso');
      return { started: true };
    } catch (err: any) {
      log.error('Erro ao iniciar download:', err);
      return { started: false, error: err?.message || 'Download failed' };
    }
  });

  // Eventos de progresso e status
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    log.info(`Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`);
    if (mainWindow) {
      mainWindow.webContents.send('update-download-progress', progressObj);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', info);
    }
  });

  autoUpdater.on('error', (err) => {
    log.error('AutoUpdater error:', err);
    if (mainWindow) {
      mainWindow.webContents.send('update-error', err?.message || 'Update error');
    }
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
