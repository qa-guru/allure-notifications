/**
 * Static file server for Playwright e2e (webServer in playwright.config.cjs).
 *
 * `python -m http.server` (ThreadingHTTPServer) listens with backlog 5: the
 * page module graph (~35 requests) plus the service-worker precache burst
 * (~40 requests) overflow it, so a random module fetch gets
 * ERR_CONNECTION_RESET / ERR_SOCKET_NOT_CONNECTED and the whole ES-module
 * graph dies — the page renders but `__ANB__` and listeners never exist.
 * node:http listens with backlog 511; same trick as kit scripts/static-server.mjs.
 *
 * Not a general-purpose server: no directory listing, no range requests, no
 * caching beyond `no-store`.
 *
 * Usage: node scripts/e2e-server.mjs --port 13011 [--root <dir>]
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : fallback;
}

const root = resolve(
  arg('--root', join(dirname(fileURLToPath(import.meta.url)), '..')),
);
const port = Number(arg('--port', '13011'));

async function resolveTarget(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  // `normalize` collapses `..` before the prefix check, so a crafted path cannot
  // walk out of the served directory.
  const candidate = resolve(root, `.${normalize(decoded)}`);
  if (candidate !== root && !candidate.startsWith(root + sep)) {
    return undefined;
  }

  const found = await stat(candidate).catch(() => undefined);
  if (found?.isDirectory()) {
    const index = join(candidate, 'index.html');
    return (await stat(index).catch(() => undefined))?.isFile()
      ? index
      : undefined;
  }
  return found?.isFile() ? candidate : undefined;
}

const server = createServer(async (request, response) => {
  const target = await resolveTarget(request.url ?? '/');
  if (!target) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('not found');
    return;
  }
  response.writeHead(200, {
    'content-type': TYPES[extname(target)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(target).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`anb e2e server → http://127.0.0.1:${port} (${root})`);
});
