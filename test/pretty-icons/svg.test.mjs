import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, num, G } from "../../skills/pretty-icons/svg.mjs";

const ICON = `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="2" y="7" width="3" height="6" rx="1" fill="currentColor" fill-opacity=".2" />
  <path d="M8 1.75v2M8 12.25v2" />
</svg>`;

test("root attrs and elements", () => {
  const s = parse(ICON);
  assert.deepEqual(s.errors, []);
  assert.equal(s.attrs.viewBox, "0 0 16 16");
  assert.equal(s.attrs["stroke-width"], "1.5");
  assert.equal(s.elements.length, 2);
  assert.equal(s.elements[0].tag, "rect");
  assert.equal(s.elements[0].attrs["fill-opacity"], ".2");
  assert.equal(s.elements[0].line, 2);
  assert.equal(s.elements[1].attrs.d, "M8 1.75v2M8 12.25v2");
});

test("num and G", () => {
  const s = parse(ICON);
  assert.equal(num(s.elements[0].attrs, "x"), 2);
  assert.equal(num(s.elements[0].attrs, "fill-opacity"), 0.2);
  assert.equal(num(s.elements[0].attrs, "rx", 0), 1);
  assert.equal(num(s.elements[1].attrs, "rx", 0), 0);
  assert.equal(G(s.attrs), 16);
  assert.equal(G({ viewBox: "0 0 24 20" }), null);
  assert.equal(G({ viewBox: "1 1 16 16" }), null);
});

test("what it refuses is reported, not thrown", () => {
  const s = parse(`<svg viewBox="0 0 16 16"><g><rect x="1" y="1" width="2" height="2"/></g><text x="1" y="1">a</text><circle cx="8" cy="8" r="2"/></svg>`);
  assert.ok(s.errors.some((e) => /<g>/.test(e)));
  assert.ok(s.errors.some((e) => /<text>/.test(e)));
  assert.equal(s.elements.length, 2); // rect and circle are still read
});

test("single-quoted attributes and attributes without spaces", () => {
  const s = parse(`<svg viewBox='0 0 16 16'><rect x='1' y="1" width='2'height="2"/></svg>`);
  assert.equal(s.elements[0].attrs.width, "2");
  assert.equal(s.elements[0].attrs.height, "2");
});

test("xml prologue, doctype and comments are skipped, line numbers kept", () => {
  const s = parse(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg viewBox="0 0 16 16">
  <!-- <rect x="9" y="9" width="2" height="2"/>
       <g> spans lines -->
  <circle cx="8" cy="8" r="2"/>
</svg>`);
  assert.deepEqual(s.errors, []);
  assert.equal(s.attrs.viewBox, "0 0 16 16");
  assert.equal(s.elements.length, 1);
  assert.equal(s.elements[0].tag, "circle");
  assert.equal(s.elements[0].line, 6);
});

test("unclosed or missing <svg> is reported", () => {
  assert.ok(parse(`<svg viewBox="0 0 16 16"><rect x="1" y="1" width="2" height="2"/>`).errors.some((e) => /unclosed <svg>/.test(e)));
  const none = parse(`<rect x="1" y="1" width="2" height="2"/>`);
  assert.ok(none.errors.some((e) => /no <svg> root/.test(e)));
  assert.deepEqual(none.attrs, {});
});

test("nested <svg>: attrs are the outermost svg's, and the nesting is reported", () => {
  const s = parse(`<svg viewBox="0 0 16 16"><svg viewBox="0 0 24 24"><rect x="1" y="1" width="2" height="2"/></svg></svg>`);
  assert.equal(s.attrs.viewBox, "0 0 16 16");
  assert.ok(s.errors.some((e) => /nested <svg>/.test(e)));
  assert.ok(!s.errors.some((e) => /unclosed <svg>/.test(e)));
});

test("an element's location is tag@line, with its index when another shares the line", () => {
  const s = parse(`<svg viewBox="0 0 16 16">\n  <rect x="2" y="2" width="4" height="4" rx="1" />\n  <path d="M1 1h1" /><path d="M3 3h1" />\n</svg>`);
  assert.deepEqual(s.elements.map((e) => e.at), ["rect@2", "path#2@3", "path#3@3"]);
});
