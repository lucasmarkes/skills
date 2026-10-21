// Chrome, the DevTools Protocol and a static file server, on Node's built-ins only.
// Node ≥ 22 has a global WebSocket, so driving Chrome needs no Playwright and no install.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, createReadStream } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";

const CHROMES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
];

/** The Chrome to drive: SPECIMEN_CHROME when it exists, else the first default path that does. */
export function findChrome(env = process.env) {
  if (env.SPECIMEN_CHROME && existsSync(env.SPECIMEN_CHROME)) return env.SPECIMEN_CHROME;
  return CHROMES.find((p) => existsSync(p)) ?? null;
}

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".tza": "application/octet-stream", ".wasm": "application/wasm",
  ".png": "image/png", ".jpg": "image/jpeg",
};

/** Serves each directory under its URL prefix ({ "/runtime/": dir }); nothing outside a root. */
export function serve(roots) {
  const mounts = Object.entries(roots).map(([prefix, dir]) => [prefix, resolve(dir)]);
  const server = createServer((req, res) => {
    const file = locate(mounts, req.url);
    if (!file) { res.writeHead(404).end("not found"); return; }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok({
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((done) => { server.closeAllConnections(); server.close(() => done()); }),
  })));
}

function locate(mounts, url) {
  let path;
  try { path = decodeURIComponent(new URL(url, "http://x").pathname); } catch { return null; }
  if (path.split("/").includes("..")) return null;
  for (const [prefix, dir] of mounts) {
    if (!path.startsWith(prefix)) continue;
    const file = resolve(dir, "." + sep + path.slice(prefix.length));
    if (file !== dir && !file.startsWith(dir + sep)) return null;
    try { if (statSync(file).isFile()) return file; } catch { /* next root */ }
  }
  return null;
}

const live = new Set(); // browsers to reap if the process ends without closing them
const dirs = new Set(); // temp dirs to remove then (render's frames)
// Chrome's helpers keep writing to the profile for a moment after SIGKILL, so removal retries on ENOTEMPTY.
const rm = (d) => rmSync(d, { recursive: true, force: true, maxRetries: 20, retryDelay: 50 });
function reap() {
  for (const b of live) try { b.kill(); } catch { /* the rest still gets cleaned */ }
  for (const d of dirs) try { rm(d); } catch { /* likewise */ }
}
process.on("exit", reap);
for (const [sig, code] of [["SIGINT", 130], ["SIGTERM", 143]]) process.once(sig, () => { reap(); process.exit(code); });

/** A temp dir removed on exit or Ctrl-C if the caller never gets to; returns a function that removes it now. */
export function tempDir(prefix) {
  const d = mkdtempSync(join(tmpdir(), prefix));
  dirs.add(d);
  return Object.assign(() => { dirs.delete(d); rm(d); }, { path: d });
}

/** Headless Chrome with WebGPU on; resolves once its DevTools socket is open. */
export async function launch({ chrome = findChrome(), gpu = true } = {}) {
  if (!chrome) throw new Error("Chrome not found: install Google Chrome, or set SPECIMEN_CHROME to its binary");
  const profile = mkdtempSync(join(tmpdir(), "specimen-chrome-"));
  const args = [
    "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--mute-audio",
  ];
  if (gpu) args.push("--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu");
  if (gpu && process.platform === "darwin") args.push("--use-angle=metal");
  const proc = spawn(chrome, [...args, "about:blank"], { stdio: "ignore" });
  let exited = false;
  const gone = new Promise((ok) => proc.once("exit", () => { exited = true; ok(); }));
  const kill = () => {
    if (!exited) try { proc.kill("SIGKILL"); } catch { /* already gone */ }
    rm(profile);
  };
  const handle = { kill };
  live.add(handle);

  let ws;
  try {
    ws = await connect(await devtoolsUrl(profile, () => exited));
  } catch (e) { live.delete(handle); kill(); throw e; }
  const cdp = client(ws);

  return {
    profile,
    async page(url, { inject } = {}) {
      const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
      const send = (method, params) => cdp.send(method, params, sessionId);
      await send("Page.enable"); await send("Runtime.enable");
      if (inject) await send("Page.addScriptToEvaluateOnNewDocument", { source: inject });
      const loaded = cdp.once("Page.loadEventFired", sessionId);
      await send("Page.navigate", { url });
      await loaded;
      return {
        send,
        on: (event, fn) => cdp.on(event, sessionId, fn),
        async evaluate(expression) {
          const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
          if (r.exceptionDetails) {
            const d = r.exceptionDetails;
            throw new Error(d.exception?.description?.split("\n")[0] ?? d.exception?.value ?? d.text);
          }
          return r.result.value;
        },
        close: () => cdp.send("Target.closeTarget", { targetId }).catch(() => {}),
      };
    },
    async close() {
      live.delete(handle);
      await cdp.send("Browser.close").catch(() => {});
      ws.close();
      await Promise.race([gone, new Promise((ok) => setTimeout(ok, 3000))]);
      kill();
    },
  };
}

async function devtoolsUrl(profile, exited) {
  const file = join(profile, "DevToolsActivePort");
  const end = Date.now() + 15000;
  while (Date.now() < end) {
    if (exited()) throw new Error("Chrome exited at startup");
    if (existsSync(file)) {
      const [port, path] = readFileSync(file, "utf8").split("\n");
      if (port && path) return `ws://127.0.0.1:${port}${path}`;
    }
    await new Promise((ok) => setTimeout(ok, 50));
  }
  throw Object.assign(new Error("Chrome did not start within 15 s"), { code: "BOOT_TIMEOUT" });
}

function connect(url) {
  return new Promise((ok, fail) => {
    const ws = new WebSocket(url);
    ws.onopen = () => ok(ws);
    ws.onerror = () => fail(Object.assign(new Error("could not reach Chrome's DevTools socket"), { code: "BOOT_TIMEOUT" }));
  });
}

function client(ws) {
  let id = 0;
  const calls = new Map(), handlers = new Set();
  ws.onmessage = ({ data }) => {
    const m = JSON.parse(data);
    if (m.id && calls.has(m.id)) {
      const { ok, fail, method } = calls.get(m.id); calls.delete(m.id);
      m.error ? fail(new Error(`${method}: ${m.error.message}`)) : ok(m.result);
    } else if (m.method) for (const h of handlers) h(m);
  };
  ws.onclose = () => { for (const { fail, method } of calls.values()) fail(new Error(`${method}: Chrome closed`)); calls.clear(); };
  const on = (event, sessionId, fn) => {
    const h = (m) => { if (m.method === event && m.sessionId === sessionId) fn(m.params); };
    handlers.add(h);
    return () => handlers.delete(h);
  };
  return {
    send: (method, params = {}, sessionId) => new Promise((ok, fail) => {
      calls.set(++id, { ok, fail, method });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId && { sessionId }) }));
    }),
    on,
    once: (event, sessionId) => new Promise((ok) => { const off = on(event, sessionId, (p) => { off(); ok(p); }); }),
  };
}

/** Runs fn again when Chrome's boot timed out (headless start does, now and then). */
export async function withRetry(fn, tries = 3) {
  for (let i = 1; ; i++) {
    try { return await fn(); } catch (e) { if (e.code !== "BOOT_TIMEOUT" || i >= tries) throw e; }
  }
}
