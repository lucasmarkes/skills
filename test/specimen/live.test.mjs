import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launch, serve } from "../../skills/specimen/cdp.mjs";
import { render } from "../../skills/specimen/render.mjs";
import { CHROME, FIXTURES, RUNTIME } from "./harness.mjs";

const skip = !CHROME && "Chrome not found";
const media = (features) => ({ features: Object.entries(features).map(([name, value]) => ({ name, value })) });
const EL = `document.querySelector("specimen-icon")`;
// the element's state once its mount attempt settles; 10 s without an answer is a failure, not a hang
const state = `Promise.race([(async () => { await customElements.whenDefined("specimen-icon"); const el = ${EL}; await el.ready;
  return { canvas: !!el.shadowRoot.querySelector("canvas"), img: !!el.shadowRoot.querySelector("img"), theme: el.stage?.theme ?? null }; })(),
  new Promise((_, no) => setTimeout(() => no(new Error("<specimen-icon> did not settle within 10 s")), 10000))])`;

/** The live fixture page with emulated media set before it loads; fn(page) runs on it. */
async function live({ inject, features = {} }, fn) {
  const server = await serve({ "/runtime/": RUNTIME, "/t/": FIXTURES });
  const browser = await launch({ chrome: CHROME });
  try {
    const page = await browser.page("about:blank", { inject });
    await page.send("Emulation.setEmulatedMedia", media(features));
    const loaded = new Promise((ok) => page.on("Page.loadEventFired", ok));
    await page.send("Page.navigate", { url: `${server.url}/t/live.html` });
    await loaded;
    return await fn(page);
  } finally { await browser.close(); await server.close(); }
}

const until = async (page, expr, ms = 15000) => {
  const end = Date.now() + ms;
  for (;;) {
    const v = await page.evaluate(expr);
    if (v || Date.now() > end) return v;
    await new Promise((ok) => setTimeout(ok, 100));
  }
};

test("the element mounts a canvas with WebGPU", { skip }, () => live({}, async (page) => {
  const s = await page.evaluate(state);
  assert.equal(s.canvas, true);
}));

test("no WebGPU keeps the poster", { skip }, () => live({ inject: "delete Navigator.prototype.gpu;" }, async (page) => {
  assert.deepEqual(await page.evaluate(state), { canvas: false, img: true, theme: null });
}));

test("reduced motion keeps the poster", { skip }, () => live({ features: { "prefers-reduced-motion": "reduce" } }, async (page) => {
  assert.deepEqual(await page.evaluate(state), { canvas: false, img: true, theme: null });
}));

test("theme follows the OS", { skip }, () => live({ features: { "prefers-color-scheme": "light" } }, async (page) => {
  assert.equal((await page.evaluate(state)).theme, "light");
  await page.send("Emulation.setEmulatedMedia", media({ "prefers-color-scheme": "dark" }));
  assert.equal(await until(page, `${EL}.stage?.theme === "dark"`), true);
  assert.equal(await page.evaluate(`${EL}.shadowRoot.querySelectorAll("canvas").length`), 1);
}));

test("render --live copies the runtime and the piece", { skip }, async () => {
  const out = mkdtempSync(join(realpathSync(tmpdir()), "live-test-"));
  try {
    const r = await render({ piece: join(FIXTURES, "cube.specimen.js"), out, live: true, size: 128, samples: 1, log: () => {} });
    assert.deepEqual(readdirSync(out).sort(), ["cube-dark-poster.jpg", "cube-light-poster.jpg", "cube.specimen.js", "specimen.js", "specimen.js.LICENSE.txt"]);
    assert.match(r.snippet, /<specimen-icon src="\/[^"]+\/cube\.specimen\.js" poster="[^"]+cube-dark-poster\.jpg" poster-light="[^"]+cube-light-poster\.jpg"><\/specimen-icon>/);
    assert.doesNotMatch(r.snippet, /<video/);
  } finally { rmSync(out, { recursive: true, force: true }); }
});

test("delivery both prints the video and the live snippet", async () => {
  const { snippet } = await import("../../skills/specimen/render.mjs");
  const s = snippet({ name: "bolt", themes: ["dark", "light"], prefix: "/icons", video: true, live: true });
  assert.match(s, /<video[^>]+poster="\/icons\/bolt-dark-poster\.jpg"/);
  assert.match(s, /<specimen-icon src="\/icons\/bolt\.specimen\.js" poster="\/icons\/bolt-dark-poster\.jpg" poster-light="\/icons\/bolt-light-poster\.jpg"><\/specimen-icon>\n<script type="module" src="\/icons\/specimen\.js"><\/script>/);
});

test("a light page shows the light poster when the stage cannot run", { skip }, () => live({ inject: "delete Navigator.prototype.gpu;", features: { "prefers-color-scheme": "light" } }, async (page) => {
  await page.evaluate(state);
  assert.match(await page.evaluate(`${EL}.shadowRoot.querySelector("img").src`), /cube-light-poster\.jpg$/);
  await page.send("Emulation.setEmulatedMedia", media({ "prefers-color-scheme": "dark" }));
  assert.equal(await until(page, `${EL}.shadowRoot.querySelector("img").src.endsWith("/cube-poster.jpg")`), true);
}));
