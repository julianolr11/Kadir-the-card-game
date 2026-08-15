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
import { app, BrowserWindow, shell, ipcMain, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import setupResolutionIPC from './ipcResolution';
import { setupAudioManager } from './audioManager';

// Cliente Steamworks (null se a inicialização falhar, ex: Steam não está rodando)
let steamClient: any = null;
// Sala (lobby) PvP atual, se houver
let currentLobby: any = null;
// Intervalo de sondagem de pacotes P2P recebidos
let p2pPollInterval: NodeJS.Timeout | undefined;

const serializeMember = (member: { steamId64: bigint; accountId: number }) => ({
  steamId64: member.steamId64.toString(),
  accountId: member.accountId,
  // A SDK 0.4.0 não expõe nome de outros usuários (sem namespace `friends`);
  // só sabemos o nosso próprio nome via localplayer.
  name:
    steamClient && member.steamId64 === steamClient.localplayer.getSteamId().steamId64
      ? steamClient.localplayer.getName()
      : null,
});

const serializeLobby = (lobby: any) => ({
  lobbyId: lobby.id.toString(),
  members: lobby.getMembers().map(serializeMember),
  ownerSteamId64: lobby.getOwner().steamId64.toString(),
});

// Resume uma mensagem P2P pro log — mensagens 'state' trafegam a cada mudança de estado da
// partida e teriam um payload enorme, então mostramos só o essencial (fase/turno/quem joga)
// em vez do JSON completo.
const summarizeP2PMessage = (message: any): string => {
  if (!message || typeof message !== 'object') return String(message);
  if (message.type === 'state') {
    const s = message.state || {};
    return `[state] phase=${s.phase} turn=${s.turn} activePlayer=${s.activePlayer}`;
  }
  const { type, ...rest } = message;
  const details = Object.entries(rest)
    .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join(' ');
  return `[${type}] ${details}`;
};

const initSteam = () => {
  try {
    // eslint-disable-next-line global-require
    const steamworks = require('steamworks.js');
    // steam_appid.txt (raiz do projeto/app) define o App ID quando nenhum é passado aqui.
    steamClient = steamworks.init();
    log.info(`Steamworks inicializado. Usuário: ${steamClient.localplayer.getName()}`);

    // Alguém entrou/saiu da sala atual: avisa o renderer para atualizar a lista de membros.
    steamClient.callback.register(steamworks.SteamCallback.LobbyChatUpdate, () => {
      if (currentLobby && mainWindow) {
        mainWindow.webContents.send('steam-lobby-updated', serializeLobby(currentLobby));
      }
    });

    // O jogador aceitou um convite (pelos amigos da Steam) para entrar numa sala.
    steamClient.callback.register(steamworks.SteamCallback.GameLobbyJoinRequested, (data: any) => {
      mainWindow?.webContents.send('steam-lobby-join-requested', {
        lobbyId: data.lobby_steam_id.toString(),
        friendSteamId64: data.friend_steam_id.toString(),
      });
    });

    // Outro jogador está tentando abrir uma conexão P2P conosco: aceitamos sempre
    // (o convite/entrada na sala já é o controle de acesso real).
    steamClient.callback.register(steamworks.SteamCallback.P2PSessionRequest, (data: any) => {
      try {
        steamClient.networking.acceptP2PSession(data.remote);
        log.info(`Sessão P2P aceita de ${data.remote.toString()}`);
      } catch (err: any) {
        log.warn(`Falha ao aceitar sessão P2P de ${data.remote?.toString()}: ${err?.message || err}`);
      }
    });

    // Sondagem de pacotes P2P recebidos (a API da Steam é baseada em polling, não em evento).
    clearInterval(p2pPollInterval);
    p2pPollInterval = setInterval(() => {
      if (!steamClient || !mainWindow) return;
      try {
        let packetSize = steamClient.networking.isP2PPacketAvailable();
        while (packetSize) {
          const packet = steamClient.networking.readP2PPacket(packetSize);
          try {
            const message = JSON.parse(packet.data.toString('utf8'));
            log.info(`[PvP] <- ${packet.steamId.steamId64.toString()}: ${summarizeP2PMessage(message)}`);
            mainWindow.webContents.send('steam-p2p-message', {
              fromSteamId64: packet.steamId.steamId64.toString(),
              message,
            });
          } catch (parseErr: any) {
            log.warn(`Pacote P2P recebido não é JSON válido: ${parseErr?.message || parseErr}`);
          }
          packetSize = steamClient.networking.isP2PPacketAvailable();
        }
      } catch (err: any) {
        log.warn(`Erro ao ler pacotes P2P: ${err?.message || err}`);
      }
    }, 50);
  } catch (err: any) {
    steamClient = null;
    log.warn(`Steamworks não inicializado (Steam não está rodando ou steam_api64.dll ausente): ${err?.message || err}`);
  }
};

// Chave da Steam Web API (ISteamUser/GetPlayerSummaries), usada só pra buscar foto de perfil
// dos membros da sala. steamworks.js não expõe avatar (não tem namespace `friends`), então
// essa é a única forma. Fica num arquivo local não versionado, do lado do steam_appid.txt.
let cachedWebApiKey: string | null | undefined;
const getWebApiKey = (): string | null => {
  if (cachedWebApiKey !== undefined) return cachedWebApiKey;
  try {
    const keyPath = path.join(process.cwd(), 'steam_webapi_key.txt');
    cachedWebApiKey = require('fs').readFileSync(keyPath, 'utf8').trim() || null;
  } catch (err) {
    cachedWebApiKey = null;
  }
  return cachedWebApiKey;
};

ipcMain.handle('steam-get-player-avatars', async (_event, steamId64s: string[]) => {
  const apiKey = getWebApiKey();
  if (!apiKey) return { ok: false, reason: 'no-api-key' };
  if (!Array.isArray(steamId64s) || steamId64s.length === 0) return { ok: true, avatars: {} };
  try {
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId64s.join(',')}`;
    const response = await fetch(url);
    if (!response.ok) {
      log.warn(`Steam Web API retornou ${response.status} ao buscar avatares`);
      return { ok: false, error: `HTTP ${response.status}` };
    }
    const data: any = await response.json();
    const avatars: Record<string, string> = {};
    (data?.response?.players || []).forEach((player: any) => {
      if (player?.steamid && player?.avatarfull) {
        avatars[player.steamid] = player.avatarfull;
      }
    });
    return { ok: true, avatars };
  } catch (err: any) {
    log.warn(`Falha ao buscar avatares via Steam Web API: ${err?.message || err}`);
    return { ok: false, error: err?.message || 'Falha ao buscar avatares' };
  }
});

ipcMain.handle('steam-get-status', () => {
  if (!steamClient) return { connected: false };
  try {
    return {
      connected: true,
      username: steamClient.localplayer.getName(),
      steamId64: steamClient.localplayer.getSteamId().steamId64.toString(),
    };
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Steam client error' };
  }
});

ipcMain.handle('steam-unlock-achievement', (_event, achievementId: string) => {
  if (!steamClient) return { activated: false, reason: 'steam-not-connected' };
  try {
    const activated = steamClient.achievement.activate(achievementId);
    log.info(`Conquista Steam "${achievementId}": ${activated ? 'ativada' : 'não reconhecida pelo App ID atual'}`);
    return { activated };
  } catch (err: any) {
    log.warn(`Falha ao ativar conquista Steam "${achievementId}": ${err?.message || err}`);
    return { activated: false, error: err?.message || 'Steam achievement error' };
  }
});

ipcMain.handle('steam-create-lobby', async () => {
  if (!steamClient) return { ok: false, reason: 'steam-not-connected' };
  try {
    // Os enums (LobbyType, SendType etc.) só existem no objeto cliente já
    // inicializado (steamClient.<namespace>.<Enum>), não no módulo `steamworks.js` em si.
    const lobby = await steamClient.matchmaking.createLobby(steamClient.matchmaking.LobbyType.FriendsOnly, 2);
    currentLobby = lobby;
    log.info(`Sala PvP criada: ${lobby.id.toString()}`);
    return { ok: true, lobby: serializeLobby(lobby) };
  } catch (err: any) {
    log.warn(`Falha ao criar sala PvP: ${err?.message || err}`);
    return { ok: false, error: err?.message || 'Falha ao criar sala' };
  }
});

ipcMain.handle('steam-join-lobby', async (_event, lobbyId: string) => {
  if (!steamClient) return { ok: false, reason: 'steam-not-connected' };
  try {
    const lobby = await steamClient.matchmaking.joinLobby(BigInt(lobbyId));
    currentLobby = lobby;
    log.info(`Entrou na sala PvP: ${lobby.id.toString()}`);
    return { ok: true, lobby: serializeLobby(lobby) };
  } catch (err: any) {
    log.warn(`Falha ao entrar na sala PvP ${lobbyId}: ${err?.message || err}`);
    return { ok: false, error: err?.message || 'Falha ao entrar na sala' };
  }
});

ipcMain.handle('steam-leave-lobby', () => {
  if (currentLobby) {
    log.info(`Saiu da sala PvP: ${currentLobby.id.toString()}`);
    currentLobby.leave();
    currentLobby = null;
  }
  return { ok: true };
});

ipcMain.handle('steam-invite-to-lobby', () => {
  if (!steamClient || !currentLobby) return { ok: false, reason: 'no-active-lobby' };
  try {
    steamClient.overlay.activateInviteDialog(currentLobby.id);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Falha ao abrir convite' };
  }
});

ipcMain.handle('steam-get-lobby', () => {
  if (!currentLobby) return { ok: false, reason: 'no-active-lobby' };
  return { ok: true, lobby: serializeLobby(currentLobby) };
});

ipcMain.handle('steam-send-p2p-message', (_event, targetSteamId64: string, message: any) => {
  if (!steamClient) return { ok: false, reason: 'steam-not-connected' };
  try {
    const payload = Buffer.from(JSON.stringify(message), 'utf8');
    const sent = steamClient.networking.sendP2PPacket(
      BigInt(targetSteamId64),
      steamClient.networking.SendType.Reliable,
      payload,
    );
    log.info(`[PvP] -> ${targetSteamId64}: ${summarizeP2PMessage(message)}`);
    return { ok: Boolean(sent) };
  } catch (err: any) {
    log.warn(`Falha ao enviar pacote P2P para ${targetSteamId64}: ${err?.message || err}`);
    return { ok: false, error: err?.message || 'Falha ao enviar pacote P2P' };
  }
});

// Novo fluxo: inicialização do autoUpdater será feita sob demanda via IPC
log.transports.file.level = 'info';
autoUpdater.logger = log;

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

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

  // Ícone customizado para Windows. Em build empacotado, 'src/' não é distribuído —
  // getAssetPath() resolve pra resources/assets/ (populado via extraResources no package.json),
  // igual ao esquema já usado pro steam_api64.dll.
  const iconPath = getAssetPath('iconlive.ico');

  const primaryWorkArea = screen.getPrimaryDisplay().workArea;
  const initialScale = Math.min(
    1,
    primaryWorkArea.width / 1280,
    primaryWorkArea.height / 720,
  );
  const initialWidth = Math.round(1280 * initialScale);
  const initialHeight = Math.round(720 * initialScale);

  mainWindow = new BrowserWindow({
    show: false,
    width: initialWidth,
    height: initialHeight,
    // O palco interno mantém 16:9; o redimensionamento real é controlado nas opções.
    resizable: true,
    maximizable: true,
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

  // Detectar se está rodando via Steam
  const isSteamBuild = !!(process.env.SteamAppId || process.env.SteamGameId);
  log.info(`Steam detected: ${isSteamBuild}`);

  // Configurar autoUpdater APENAS se NÃO estiver na Steam
  if (!isSteamBuild) {
    autoUpdater.autoDownload = false; // Não baixar automaticamente, só quando usuário clicar
    autoUpdater.autoInstallOnAppQuit = true; // Instalar ao sair do app
    log.info('AutoUpdater configurado (modo standalone)');
  } else {
    log.info('AutoUpdater DESABILITADO (rodando via Steam)');
  }

  // O update será iniciado manualmente via IPC do renderer
  // IPC handlers para update (retorna sem fazer nada se Steam)
  ipcMain.handle('update-check', async () => {
    if (isSteamBuild) {
      log.info('Update check bloqueado - rodando via Steam');
      return { updateAvailable: false, steamBuild: true };
    }
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
    if (isSteamBuild) {
      log.info('Update download bloqueado - rodando via Steam');
      return { started: false, steamBuild: true };
    }
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

  ipcMain.handle('quit-and-install', () => {
    if (isSteamBuild) {
      log.info('Quit-and-install bloqueado - rodando via Steam');
      return;
    }
    log.info('Reiniciando para instalar atualização...');
    autoUpdater.quitAndInstall();
  });

  // Eventos de progresso e status (apenas se não estiver na Steam)
  if (!isSteamBuild) {
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
  }
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
    initSteam();
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
    if (steamClient) {
      try {
        // eslint-disable-next-line global-require
        require('steamworks.js').electronEnableSteamOverlay();
      } catch (err: any) {
        log.warn(`Falha ao habilitar o overlay da Steam: ${err?.message || err}`);
      }
    }
  })
  .catch(console.log);
