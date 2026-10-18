// A piece open on the runtime page in headless Chrome: what render, sheet and validate share.
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findChrome, launch, serve, withRetry } from "./cdp.mjs";

export const RUNTIME = join(dirname(fileURLToPath(import.meta.url)), "runtime");

const timeout = (p, ms, what) => Promise.race([p, new Promise((_, fail) => setTimeout(() =>
  fail(Object.assign(new Error(`${what} did not answer within ${ms / 1000} s`), { code: "BOOT_TIMEOUT" })), ms))]);

/** Chrome check up front, so a missing browser is named before any work. */
export function requireChrome() {
  const chrome = findChrome();
  if (!chrome) throw new Error("Chrome not found: install Google Chrome, or set SPECIMEN_CHROME to its binary");
  return chrome;
}

/**
 * open({ theme, mode, size, denoise, query }) → { page, info: { name, duration, frames }, frame(n, samples) → Buffer, close }.
 * Each open gets its own Chrome; a boot that hangs is retried up to 3 times.
 */
export async function session(file, { chrome = requireChrome() } = {}) {
  const server = await serve({ "/runtime/": RUNTIME, "/piece/": dirname(file) });
  const open = async ({ theme = "dark", mode = "rt", size = 768, denoise = false, query = {}, inject } = {}) => withRetry(async () => {
    const browser = await launch({ chrome });
    try {
      const q = new URLSearchParams({ piece: `/piece/${encodeURIComponent(basename(file))}`, theme, mode, size, ...(denoise && { denoise: "1" }), ...query });
      const page = await timeout(browser.page(`${server.url}/runtime/page.html?${q}`, { inject }), 30000, "the runtime page");
      const info = await timeout(page.evaluate("__specimen.ready"), 60000, "WebGPU start-up");
      return {
        page, info,
        frame: async (n, samples = 32) => Buffer.from((await page.evaluate(`__specimen.frame(${n}, ${samples})`)).split(",")[1], "base64"),
        close: () => browser.close(),
      };
    } catch (e) { await browser.close(); throw e; }
  });
  return { open, close: () => server.close() };
}
