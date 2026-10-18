import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findChrome, serve, launch } from "../../skills/specimen/cdp.mjs";

const tmp = () => mkdtempSync(join(realpathSync(tmpdir()), "specimen-test-"));
const CHROME = findChrome();

test("findChrome honours SPECIMEN_CHROME", () => {
  const dir = tmp();
  try {
    const fake = join(dir, "chrome"); writeFileSync(fake, "");
    assert.equal(findChrome({ SPECIMEN_CHROME: fake }), fake);
    assert.notEqual(findChrome({ SPECIMEN_CHROME: join(dir, "missing") }), join(dir, "missing"));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("serve refuses paths outside its root", async () => {
  const dir = tmp();
  writeFileSync(join(dir, "a.js"), "export {}");
  const s = await serve({ "/runtime/": dir });
  try {
    for (const p of ["/runtime/../package.json", "/runtime/%2e%2e/package.json", "/elsewhere/a.js", "/runtime/missing.js"]) {
      const r = await fetch(s.url + p); await r.arrayBuffer();
      assert.equal(r.status, 404, p);
    }
    const ok = await fetch(s.url + "/runtime/a.js");
    assert.equal(ok.status, 200);
    assert.match(ok.headers.get("content-type"), /^text\/javascript/);
  } finally { await s.close(); rmSync(dir, { recursive: true, force: true }); }
});

/** A served folder with index.html holding `body`, plus a browser; cleans up both. */
async function withPage(body, fn, opts) {
  const dir = tmp();
  writeFileSync(join(dir, "index.html"), `<!doctype html><script>${body}</script>`);
  const s = await serve({ "/": dir });
  const browser = await launch({ chrome: CHROME });
  try {
    const page = await browser.page(s.url + "/index.html", opts);
    return await fn(page, browser);
  } finally { await browser.close(); await s.close(); rmSync(dir, { recursive: true, force: true }); }
}

test("a page evaluates and closes cleanly", { skip: !CHROME && "Chrome not found" }, async () => {
  let profile;
  await withPage("window.x = 21 * 2", async (page, browser) => {
    assert.equal(await page.evaluate("x"), 42);
    profile = browser.profile;
    assert.ok(existsSync(profile));
  });
  assert.equal(existsSync(profile), false, "profile removed on close");
});

test("evaluate rejects with the page's error", { skip: !CHROME && "Chrome not found" }, async () => {
  await withPage("", async (page) => {
    await assert.rejects(page.evaluate("(() => { throw new Error('boom') })()"), /boom/);
    await assert.rejects(page.evaluate("Promise.reject(new Error('late boom'))"), /late boom/);
  });
});

test("inject runs before page scripts", { skip: !CHROME && "Chrome not found" }, async () => {
  await withPage("window.seen = window.flag", async (page) => {
    assert.equal(await page.evaluate("seen"), 1);
  }, { inject: "window.flag = 1" });
});
