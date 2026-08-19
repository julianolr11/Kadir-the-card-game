# Electron Security Review — kadiroms

## Executive Summary

The Electron hardening baseline is solid: `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `enableRemoteModule: false`, and a preload script that exposes a narrow, typed API via `contextBridge` instead of the raw `ipcRenderer`. No `remote` module usage, no `eval`, no obvious command injection in IPC handlers.

Four findings came out of the review, none critical — the main-process/renderer boundary is not broken by any of them. The two worth fixing before the next build are a DevTools leftover and an over-permissive permission handler.

## Medium

### M1 — DevTools opens automatically in every build, including production
**File:** [src/main/main.ts:365-367](src/main/main.ts#L365-L367)

```ts
mainWindow.on('ready-to-show', () => {
  ...
  // TEMP: DevTools aberto pra sessão de debug atual. Remover antes do build final.
  mainWindow.webContents.openDevTools();
});
```

This call isn't gated by `isDebug` (unlike `installExtensions()` above it), so it ships in packaged/Steam builds too. **Impact:** anyone running the game gets full DevTools access to the renderer — they can inspect all exposed `window.electron.ipcRenderer.*` calls (Steam lobby/P2P/update channels), read in-memory game state, and script calls to those IPC channels directly. Given the P2P netcode already has no authoritative server, this makes reverse-engineering the client-side game logic and message formats trivially easy, which lowers the bar for anyone trying to cheat.

**Fix:** gate it the same way the rest of the file gates dev-only behavior:
```ts
if (isDebug) {
  mainWindow.webContents.openDevTools();
}
```

### M2 — Permission check handler grants every permission request unconditionally
**File:** [src/main/main.ts:353](src/main/main.ts#L353)

```ts
mainWindow.webContents.session.setPermissionCheckHandler(() => true);
```

The comment says this is for autoplay audio, but the handler ignores the `permission` argument entirely and approves *everything* — camera, microphone, geolocation, notifications, MIDI, etc. — for any content the window ever loads. Today the app only loads its own bundled `index.html`, so the practical exposure is low, but it's a blanket allow with no scoping, and it'll silently stay permissive if the renderer ever loads external/remote content (e.g. an embedded webview, an OAuth flow, help/CDN content).

**Fix:** scope it to what's actually needed:
```ts
mainWindow.webContents.session.setPermissionCheckHandler((_wc, permission) =>
  permission === 'media', // autoplay audio
);
```

## Low

### L1 — `setWindowOpenHandler` opens any URL externally without validation
**File:** [src/main/main.ts:377-380](src/main/main.ts#L377-L380)

```ts
mainWindow.webContents.setWindowOpenHandler((edata) => {
  shell.openExternal(edata.url);
  return { action: 'deny' };
});
```

Correctly denies opening a new BrowserWindow, but hands *any* `window.open()` target straight to `shell.openExternal` with no scheme/host check. If any renderer-side content ever becomes attacker-influenced (card flavor text, chat, a future P2P payload rendered as a link), this could be used to launch arbitrary URLs, including non-http(s) schemes, via the user's OS handler. Low severity today since there's no untrusted-content path calling `window.open()`, but cheap to close off.

**Fix:** allow-list the scheme before opening:
```ts
mainWindow.webContents.setWindowOpenHandler((edata) => {
  if (/^https?:/i.test(edata.url)) {
    shell.openExternal(edata.url);
  }
  return { action: 'deny' };
});
```

## Info / Design note

### I1 — P2P game-state messages are trusted as-is by the renderer
**File:** [src/main/main.ts:96-117](src/main/main.ts#L96-L117), relayed via `steam-p2p-message`

Incoming P2P packets are only `JSON.parse`'d (malformed JSON is caught and logged) and then forwarded to the renderer verbatim — there's no schema/shape validation on `message.type`/`message.state` before game logic consumes it. This isn't an AppSec vulnerability (no code execution path — sandboxed renderer, no eval), but it means a modified client on the other end of the P2P connection can send fabricated `state` messages and the receiving client has no way to detect that. This is the same trust boundary already called out in the project's [Ranked mode plan](../../memory/project_ranked_mode_plan.md) — worth keeping in mind when Ranked work resumes, not something to fix now.

### I2 — Steam Web API key file, confirmed not committed
**File:** [src/main/main.ts:131](src/main/main.ts#L131) reads `steam_webapi_key.txt` from `process.cwd()`

Verified this file is **not** tracked in git (`git ls-files` in kadiroms only shows `resources/steam/steam_api64.dll`). No action needed — flagging only so it stays on the radar if the build/release scripts ever change how the working directory is set.
