// Builds ../packages/component-library, ../api and ../web and copies the
// results into desktop/app so electron-builder can ship them.
//
//   desktop/app/api  -> compiled API + production node_modules
//   desktop/app/web  -> Next.js "standalone" server (+ static files + public)

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const desktop = path.resolve(here, '..');
const root = path.resolve(desktop, '..');
const out = path.join(desktop, 'app');
const isWin = process.platform === 'win32';

function run(cmd, args, cwd, extraEnv = {}) {
  console.log(`\n> (${path.relative(root, cwd) || '.'}) ${cmd} ${args.join(' ')}`);
  const res = spawnSync(isWin ? `${cmd}.cmd` : cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: isWin,
    env: { ...process.env, ...extraEnv },
  });
  if (res.status !== 0) {
    console.error(`\nCommand failed: ${cmd} ${args.join(' ')}`);
    process.exit(res.status ?? 1);
  }
}

function hasScript(dir, name) {
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  return Boolean(pkg.scripts && pkg.scripts[name]);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return false;
  fs.cpSync(from, to, { recursive: true, dereference: true });
  return true;
}

function findFile(dir, name, depth = 4) {
  if (depth < 0 || !fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name === name) return path.join(dir, entry.name);
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      const hit = findFile(path.join(dir, entry.name), name, depth - 1);
      if (hit) return hit;
    }
  }
  return null;
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

/* 1. component library ----------------------------------------------------- */
const lib = path.join(root, 'packages', 'component-library');
if (fs.existsSync(lib)) {
  run('npm', ['ci'], lib);
  if (hasScript(lib, 'build')) run('npm', ['run', 'build'], lib);
}

/* 2. API ------------------------------------------------------------------- */
const api = path.join(root, 'api');
run('npm', ['ci'], api);
run('npm', ['run', 'build'], api);

const apiOut = path.join(out, 'api');
fs.mkdirSync(apiOut, { recursive: true });
if (!copyDir(path.join(api, 'dist'), path.join(apiOut, 'dist'))) {
  console.error('api/dist was not created. Check "outDir" in api/tsconfig.json and the "build" script.');
  process.exit(1);
}
// Runtime files the API may read from disk (schema + migrations).
copyDir(path.join(api, 'sql'), path.join(apiOut, 'sql'));
fs.copyFileSync(path.join(api, 'package.json'), path.join(apiOut, 'package.json'));
if (fs.existsSync(path.join(api, 'package-lock.json'))) {
  fs.copyFileSync(path.join(api, 'package-lock.json'), path.join(apiOut, 'package-lock.json'));
}
run('npm', ['ci', '--omit=dev'], apiOut);

// The API requires the local workspace package (@cms/component-library) at runtime.
// In dev it resolves through the repo; in the packaged app it has to be a real
// folder inside the API's node_modules.
if (fs.existsSync(lib)) {
  const libPkg = JSON.parse(fs.readFileSync(path.join(lib, 'package.json'), 'utf8'));
  const dest = path.join(apiOut, 'node_modules', ...libPkg.name.split('/'));
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(lib, dest, {
    recursive: true,
    dereference: true,
    filter: (src) => {
      const parts = src.split(path.sep);
      return !parts.includes('node_modules') && !parts.includes('__tests__');
    },
  });
  // Install the library's own runtime dependencies, if it has any.
  if (libPkg.dependencies && Object.keys(libPkg.dependencies).length > 0) {
    const lockFile = fs.existsSync(path.join(dest, 'package-lock.json'));
    run('npm', [lockFile ? 'ci' : 'install', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'], dest);
  }
  console.log(`Copied ${libPkg.name} into the API's node_modules`);
}

/* 3. Web (Next.js standalone) --------------------------------------------- */
const web = path.join(root, 'web');
run('npm', ['ci'], web);
run('npm', ['run', 'build'], web, { NEXT_TELEMETRY_DISABLED: '1' });

const standalone = path.join(web, '.next', 'standalone');
if (!fs.existsSync(standalone)) {
  console.error(
    'web/.next/standalone was not created.\n' +
      "Add  output: 'standalone'  to web/next.config.ts and run again.",
  );
  process.exit(1);
}

const webOut = path.join(out, 'web');
copyDir(standalone, webOut);

// server.js can sit at the root or inside a nested folder (monorepo tracing).
const serverJs = findFile(webOut, 'server.js');
if (!serverJs) {
  console.error('server.js not found inside the standalone output.');
  process.exit(1);
}
const serverDir = path.dirname(serverJs); 

// Standalone does not include static assets or /public - copy them next to server.js.
copyDir(path.join(web, '.next', 'static'), path.join(serverDir, '.next', 'static'));
copyDir(path.join(web, 'public'), path.join(serverDir, 'public'));

console.log(`\nDone. App prepared in: ${out}`);
console.log(`Web server: ${path.relative(out, serverJs)}`);
