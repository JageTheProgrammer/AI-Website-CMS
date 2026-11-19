import { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } from 'electron';
import { ChildProcess, spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';

/* -------------------------------------------------------------------------- */
/* Paths                                                                      */
/* -------------------------------------------------------------------------- */

// desktop/app is produced by scripts/prepare.mjs and shipped as extraResources.
const APP_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'app')
  : path.join(__dirname, '..', 'app');

const firstExisting = (candidates: string[]): string | null =>
  candidates.find((p) => fs.existsSync(p)) ?? null;

// Next.js standalone output puts server.js at the root, or in a "web" subfolder
// when the file tracing root is higher up.
const WEB_SERVER = firstExisting([
  path.join(APP_DIR, 'web', 'server.js'),
  path.join(APP_DIR, 'web', 'web', 'server.js'),
]);

// tsc output location depends on your api/tsconfig.json rootDir.
const API_ENTRY = firstExisting([
  path.join(APP_DIR, 'api', 'dist', 'index.js'),
  path.join(APP_DIR, 'api', 'dist', 'src', 'index.js'),
]);

const DATA_DIR = app.getPath('userData');
const LOG_DIR = path.join(DATA_DIR, 'logs');
const KEYS_FILE = path.join(DATA_DIR, 'keys.json');
const SECRET_FILE = path.join(DATA_DIR, 'local-secret.txt');

/* -------------------------------------------------------------------------- */
/* AI provider keys (encrypted with the OS keychain via safeStorage)          */
/* -------------------------------------------------------------------------- */

const PROVIDER_ENV: Record<string, string> = {
  gemini: 'GEMINI_API_KEY',
  groq: 'GROQ_API_KEY',
  cerebras: 'CEREBRAS_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
};

type StoredKeys = Record<string, string>; // provider -> base64 ciphertext

function readStoredKeys(): StoredKeys {
  try {
    return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8')) as StoredKeys;
  } catch {
    return {};
  }
}

function writeStoredKeys(keys: StoredKeys): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys), { mode: 0o600 });
}

function decryptedKeysAsEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  if (!safeStorage.isEncryptionAvailable()) return env;
  const stored = readStoredKeys();
  for (const [provider, cipher] of Object.entries(stored)) {
    const envName = PROVIDER_ENV[provider];
    if (!envName) continue;
    try {
      env[envName] = safeStorage.decryptString(Buffer.from(cipher, 'base64'));
    } catch {
      /* key unreadable (e.g. keychain reset) - ignore it */
    }
  }
  return env;
}

/** A random secret generated once per install, used for sessions/JWTs. */
function localSecret(): string {
  try {
    return fs.readFileSync(SECRET_FILE, 'utf8').trim();
  } catch {
    const secret = crypto.randomBytes(48).toString('hex');
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SECRET_FILE, secret, { mode: 0o600 });
    return secret;
  }
}

/* -------------------------------------------------------------------------- */
/* Child processes                                                            */
/* -------------------------------------------------------------------------- */

let mainWindow: BrowserWindow | null = null;
let webProc: ChildProcess | null = null;
let apiProc: ChildProcess | null = null;
let webPort = 0;
let apiPort = 0;
let quitting = false;

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address() as net.AddressInfo;
      srv.close(() => resolve(port));
    });
  });
}

function waitForHttp(port: number, timeoutMs = 60_000): Promise<void> {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get({ host: '127.0.0.1', port, path: '/', timeout: 2000 }, (res) => {
        res.resume();
        resolve(); // any HTTP response means the server is up
      });
      req.on('error', retry);
      req.on('timeout', () => {
        req.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for port ${port}`));
      } else {
        setTimeout(attempt, 400);
      }
    };
    attempt();
  });
}

function startNodeProcess(
  name: string,
  script: string,
  cwd: string,
  env: Record<string, string>,
): ChildProcess {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const log = fs.createWriteStream(path.join(LOG_DIR, `${name}.log`), { flags: 'a' });

  // Run the script with Electron's own bundled Node - users need no Node install.
  const child = spawn(process.execPath, [script], {
    cwd,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  child.stdout?.pipe(log);
  child.stderr?.pipe(log);
  child.on('exit', (code) => {
    log.write(`\n[${name}] exited with code ${code}\n`);
    log.end();
    if (!quitting && code !== 0 && code !== null) {
      console.error(`[${name}] crashed, see ${LOG_DIR}`);
    }
  });
  return child;
}

function sharedEnv(): Record<string, string> {
  const secret = localSecret();
  return {
    NODE_ENV: 'production',
    LOCAL_MODE: '1',
    DATA_DIR,
    SESSION_SECRET: secret,
  };
}

/**
 * Picks the AI provider from whichever keys the user has saved.
 * Order = best free option first. With no key saved it falls back to a local
 * Ollama (what your env.ts used by default).
 */
function pickAiProvider(keyEnv: Record<string, string>): string {
  const order: Array<[string, string]> = [
    ['gemini', 'GEMINI_API_KEY'],
    ['groq', 'GROQ_API_KEY'],
    ['cerebras', 'CEREBRAS_API_KEY'],
    ['mistral', 'MISTRAL_API_KEY'],
    ['openrouter', 'OPENROUTER_API_KEY'],
  ];
  for (const [provider, envName] of order) {
    if (keyEnv[envName]) return provider;
  }
  return 'ollama';
}

function startApi(): void {
  if (!API_ENTRY) throw new Error('API build not found. Run "npm run prepare:app" first.');
  const keyEnv = decryptedKeysAsEnv();
  // Working directory = the api folder (contains sql/schema.sqlite.sql),
  // regardless of whether the build is dist/index.js or dist/src/index.js.
  apiProc = startNodeProcess('api', API_ENTRY, path.join(APP_DIR, 'api'), {
    ...sharedEnv(),
    ...keyEnv,
    PORT: String(apiPort),
    HOST: '127.0.0.1',
    DB_DRIVER: 'sqlite',
    SQLITE_PATH: path.join(DATA_DIR, 'cms.sqlite'),
    AI_PROVIDER: pickAiProvider(keyEnv),
    CORS_ORIGIN: `http://127.0.0.1:${webPort}`,
  });
}

function startWeb(): void {
  if (!WEB_SERVER) throw new Error('Web build not found. Run "npm run prepare:app" first.');
  const apiUrl = `http://127.0.0.1:${apiPort}`;
  webProc = startNodeProcess('web', WEB_SERVER, path.dirname(WEB_SERVER), {
    ...sharedEnv(),
    PORT: String(webPort),
    HOSTNAME: '127.0.0.1',
    // Match whichever name web/src/lib/api/client.ts reads.
    API_URL: apiUrl,
    API_BASE_URL: apiUrl,
    NEXT_PUBLIC_API_URL: apiUrl,
  });
}

async function restartApi(): Promise<void> {
  if (apiProc && !apiProc.killed) apiProc.kill();
  await new Promise((r) => setTimeout(r, 500));
  startApi();
  await waitForHttp(apiPort);
}

function stopAll(): void {
  quitting = true;
  for (const child of [webProc, apiProc]) {
    if (child && !child.killed) child.kill();
  }
}

/* -------------------------------------------------------------------------- */
/* Window                                                                     */
/* -------------------------------------------------------------------------- */

const LOADING_HTML =
  'data:text/html;charset=utf-8,' +
  encodeURIComponent(`<!doctype html><meta charset="utf-8"><title>Starting...</title>
<body style="margin:0;display:grid;place-items:center;height:100vh;background:#0b0b0f;color:#e7e7ee;font-family:system-ui,sans-serif">
<div style="text-align:center"><h2 style="font-weight:600">Starting CMS Desktop...</h2>
<p style="opacity:.6">First launch can take a few seconds.</p></div></body>`);

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0b0b0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const origin = () => `http://127.0.0.1:${webPort}`;

  // Links to other sites open in the user's normal browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(origin())) return { action: 'allow' };
    void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('data:') || url.startsWith(origin())) return;
    event.preventDefault();
    void shell.openExternal(url);
  });

  void win.loadURL(LOADING_HTML);
  win.on('closed', () => {
    mainWindow = null;
  });
  return win;
}

/* -------------------------------------------------------------------------- */
/* IPC (called from the web UI through preload.ts)                            */
/* -------------------------------------------------------------------------- */

ipcMain.handle('keys:status', () => {
  const stored = readStoredKeys();
  return Object.fromEntries(Object.keys(PROVIDER_ENV).map((p) => [p, Boolean(stored[p])]));
});

ipcMain.handle('keys:save', async (_event, provider: string, key: string) => {
  if (!PROVIDER_ENV[provider]) return { ok: false, error: 'Unknown provider' };
  if (typeof key !== 'string' || key.trim().length < 8) return { ok: false, error: 'Key looks too short' };
  if (!safeStorage.isEncryptionAvailable()) {
    return { ok: false, error: 'Secure key storage is not available on this system (no OS keychain).' };
  }
  const stored = readStoredKeys();
  stored[provider] = safeStorage.encryptString(key.trim()).toString('base64');
  writeStoredKeys(stored);
  await restartApi();
  return { ok: true };
});

ipcMain.handle('keys:delete', async (_event, provider: string) => {
  const stored = readStoredKeys();
  delete stored[provider];
  writeStoredKeys(stored);
  await restartApi();
  return { ok: true };
});

ipcMain.handle('app:open-data', () => shell.openPath(DATA_DIR));

/* -------------------------------------------------------------------------- */
/* Lifecycle                                                                  */
/* -------------------------------------------------------------------------- */

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    mainWindow = createWindow();
    try {
      [apiPort, webPort] = [await freePort(), await freePort()];
      startApi();
      await waitForHttp(apiPort);
      startWeb();
      await waitForHttp(webPort);
      await mainWindow.loadURL(`http://127.0.0.1:${webPort}`);
    } catch (err) {
      stopAll();
      dialog.showErrorBox(
        'CMS Desktop could not start',
        `${(err as Error).message}\n\nLogs are in:\n${LOG_DIR}`,
      );
      app.quit();
    }
  });

  app.on('before-quit', stopAll);
  app.on('window-all-closed', () => app.quit());
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && webPort) {
      mainWindow = createWindow();
      void mainWindow.loadURL(`http://127.0.0.1:${webPort}`);
    }
  });
}
