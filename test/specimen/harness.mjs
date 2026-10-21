// Opens a piece on the runtime page in headless Chrome, for the specimen tests.
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { findChrome, launch, serve } from "../../skills/specimen/cdp.mjs";

export const CHROME = findChrome();
export const RUNTIME = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "skills", "specimen", "runtime");
export const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

/** { page, close } with `piece` loaded; query adds to theme/mode/size. */
export async function open(piece, { theme = "dark", mode = "rt", size = 256, inject, query = {} } = {}) {
  const server = await serve({ "/runtime/": RUNTIME, "/piece/": dirname(piece) });
  const browser = await launch({ chrome: CHROME });
  const q = new URLSearchParams({ piece: `/piece/${basename(piece)}`, theme, mode, size, ...query });
  try {
    const page = await browser.page(`${server.url}/runtime/page.html?${q}`, { inject });
    return { page, close: async () => { await browser.close(); await server.close(); } };
  } catch (e) { await browser.close(); await server.close(); throw e; }
}

/** RGBA of pixel (x, y) in frame n, read back in the page. */
export const pixel = (n, x, y) => `(async () => {
  const img = new Image(); img.src = await __specimen.frame(${n}, 1); await img.decode();
  const c = new OffscreenCanvas(img.width, img.height).getContext("2d"); c.drawImage(img, 0, 0);
  return [...c.getImageData(${x}, ${y}, 1, 1).data];
})()`;
