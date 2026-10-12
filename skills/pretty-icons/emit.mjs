#!/usr/bin/env node
/**
 * Writes a passing set where the app consumes icons:
 *   node emit.mjs <folder> --as svg    --to <dir>          one .svg per icon and an index.ts
 *   node emit.mjs <folder> --as react  --to <file.tsx>     one component per icon; --wrapper <fn>[@module] for the ICONS = { name: fn(<>…</>) } shape
 *   node emit.mjs <folder> --as sprite --to <file.svg>     one <symbol> per icon
 * It converts; it never draws or moves a coordinate, and it runs check.mjs first.
 */
import { existsSync, mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSet, readSet, formatFailure } from "./check.mjs";
import { parse, withNs } from "./svg.mjs";

export { withNs };

const AS = ["svg", "react", "sprite"];
// JSX names: kebab and namespaced (xlink:href) to camel; data-* and aria-* stay as written.
const jsxName = (k) => (/^(data|aria)-/.test(k) ? k : k.replace(/[-:]([a-z])/g, (_, c) => c.toUpperCase()));
// Root attributes a <symbol> does not take: the sprite's <use> sizes and labels it.
const NOT_ON_SYMBOL = ["width", "height", "aria-hidden"];
const EXPORT = "icons";
const BANNER = "/** Drawn by pretty-icons: edit the .svg sources, never this file, and emit it again. */";
// Words a camelCase import cannot be: `import delete from …` is a syntax error.
const RESERVED = new Set("arguments await break case catch class const continue debugger default delete do else enum eval export extends false finally for function if implements import in instanceof interface let new null package private protected public return static super switch this throw true try typeof var void while with yield".split(" "));

/** The words of an icon name, or a throw when the name cannot become an identifier. */
function words(name) {
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) throw new Error(`"${name}" cannot become an identifier: start with a letter, use letters, digits, - or _`);
  return name.split(/[-_]/).filter(Boolean);
}
const cap = (w) => w[0].toUpperCase() + w.slice(1);
export const componentName = (name) => words(name).map(cap).join("") + "Icon";
function importName(name) {
  const [first, ...rest] = words(name);
  const id = first[0].toLowerCase() + first.slice(1) + rest.map(cap).join("");
  if (RESERVED.has(id)) throw new Error(`"${name}" cannot become an identifier: "${id}" is a reserved word`);
  if (id === EXPORT) throw new Error(`"${name}" cannot become an identifier: "${id}" is the name index.ts exports`);
  return id;
}
/** Identifiers for a set; two names that become one identifier would declare it twice. */
function identifiers(set, fn) {
  const ids = set.map((s) => fn(s.name));
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) throw new Error(`two icons become the identifier ${dup}: rename one`);
  return ids;
}

/** `fn` or `fn@module`; the function is called as written, the import names its first segment. */
function parseWrapper(wrapper) {
  const at = wrapper.indexOf("@");
  const fn = at < 0 ? wrapper : wrapper.slice(0, at), mod = at < 0 ? undefined : wrapper.slice(at + 1);
  if (!/^[A-Za-z_$][\w$.]*$/.test(fn)) throw new Error(`--wrapper "${fn}" is not a function name`);
  if (mod !== undefined && !mod.trim()) throw new Error(`--wrapper "${wrapper}" names no module after @`);
  return { fn, mod };
}


// A single-quoted source attribute may hold `"`; a bare `&` is escaped, an entity already written is kept.
const esc = (v) => v.replace(/&(?!(?:[a-z]\w*|#\d+|#x[\da-f]+);)/gi, "&amp;").replace(/"/g, "&quot;");
const attrText = (attrs, rename = (k) => k) => Object.entries(attrs).map(([k, v]) => `${rename(k)}="${esc(v)}"`).join(" ");
const jsxAttrs = (attrs) => attrText(attrs, jsxName);
// The knockout's marks are the drawer's and check.mjs's: data-cut names the cut, data-body keeps the uncut geometry.
// Neither belongs in an app. Every other data-* stays, as it does today.
const MARKS = ["data-cut", "data-body"];
const stripMarks = (attrs) => Object.fromEntries(Object.entries(attrs).filter(([k]) => !MARKS.includes(k)));
const inner = (s) => parse(s.text).elements.map((el) => `<${el.tag} ${jsxAttrs(stripMarks(el.attrs))} />`);
const rootAttrs = (s, drop = []) => Object.fromEntries(Object.entries(parse(s.text).attrs).filter(([k]) => k !== "xmlns" && !k.startsWith("xmlns:") && !drop.includes(k)));
// A JSX root takes no namespaced attribute (xmlns:xlink, xml:space): React sets the namespace itself.
const jsxRootAttrs = (s) => Object.fromEntries(Object.entries(rootAttrs(s)).filter(([k]) => !k.includes(":")));

const shellArg = (a) => (/^[\w./@:=+,-]+$/.test(a) ? a : `'${a.replace(/'/g, "'\\''")}'`);
const posix = (p) => p.replace(/\\/g, "/");
/**
 * The banner of an emitted .ts or .tsx: where its sources are, relative to the file, and the
 * command that wrote it, with its arguments as given and the folder to run it from.
 */
export function banner({ folder, as, to, wrapper, cwd = process.cwd() }) {
  const dest = resolve(cwd, to), at = as === "svg" ? dest : dirname(dest);
  const src = posix(relative(at, resolve(cwd, folder))) || ".", from = posix(relative(at, cwd)) || ".";
  const cmd = ["node <skill-dir>/emit.mjs", ...[folder, "--as", as, "--to", to, ...(wrapper ? ["--wrapper", wrapper] : [])].map(shellArg)].join(" ");
  const lines = [`Drawn by pretty-icons from the .svg files in ${src.replace(/\/+$/, "")}/ (relative to this file):`, `edit those, never this file, then emit it again, from \`${from}\`:`, cmd];
  return ["/**", ...lines.map((l) => ` * ${l.replace(/\*\//g, "*\\/")}`), " */"].join("\n");
}

export function toReact(set, { wrapper, banner: head0 = BANNER } = {}) {
  if (wrapper) {
    const { fn, mod } = parseWrapper(wrapper);
    const head = mod !== undefined ? `import { ${fn.split(".")[0]} } from ${JSON.stringify(mod)};\n\n${head0}` : `${head0}\n// ${fn} must be in scope where this file is used: pass --wrapper ${fn}@<module> to import it.`;
    const entries = set.map((s) => `  ${/^[a-z_$][\w$]*$/i.test(s.name) ? s.name : JSON.stringify(s.name)}: ${fn}(\n    <>\n${inner(s).map((l) => `      ${l}`).join("\n")}\n    </>,\n  ),`);
    return `${head}\nexport const ICONS = {\n${entries.join("\n")}\n};\n`;
  }
  const names = identifiers(set, componentName);
  const comps = set.map((s, i) => `export const ${names[i]} = (props: SVGProps<SVGSVGElement>) => (\n  <svg ${jsxAttrs(jsxRootAttrs(s))} {...props}>\n${inner(s).map((l) => `    ${l}`).join("\n")}\n  </svg>\n);`);
  return `import type { SVGProps } from "react";\n\n${head0}\n\n${comps.join("\n\n")}\n`;
}

export function toSprite(set) {
  const symbols = set.map((s) => `  <symbol id="${esc(s.name)}" ${attrText(rootAttrs(s, NOT_ON_SYMBOL))}>\n${parse(s.text).elements.map((el) => `    <${el.tag} ${attrText(stripMarks(el.attrs))} />`).join("\n")}\n  </symbol>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join("\n")}\n</svg>\n`;
}

export function toIndex(set, { banner: head = BANNER } = {}) {
  const ids = identifiers(set, importName);
  return `${head}\n${set.map((s, i) => `import ${ids[i]} from "./${s.name}.svg";`).join("\n")}\n\nexport const ${EXPORT} = { ${ids.join(", ")} };\n`;
}

// The file as written, less the two marks; the regex matches an attribute written by knockout.mjs or modifiers.mjs (compose quotes with ").
const stripText = (text) => text.replace(/\s+data-(cut|body)="[^"]*"/g, "");

export async function emit(folder, { as, to, wrapper }) {
  if (!AS.includes(as)) throw new Error(`--as must be ${AS.join(", ")}, not "${as}"`);
  const dir = resolve(folder);
  const r = await checkSet(dir);
  if (!r.measured) throw new Error(`check: not measured: ${r.why}`);
  if (r.failures.length) throw new Error(`check failed:\n${r.failures.map(formatFailure).join("\n")}`);
  const set = readSet(dir), dest = resolve(to), head = banner({ folder, as, to, wrapper });
  if (as === "svg") {
    const index = toIndex(set, { banner: head });
    mkdirSync(dest, { recursive: true });
    const written = set.map((s) => { const p = join(dest, `${s.name}.svg`); writeFileSync(p, withNs(stripText(s.text))); return p; });
    // The folder is the set's alone: an index.ts already there is replaced, and the caller says so.
    const idx = join(dest, "index.ts"), replaced = existsSync(idx);
    writeFileSync(idx, index); written.push(idx);
    return Object.assign(written, { replaced: replaced ? ["index.ts"] : [] });
  }
  const text = as === "react" ? toReact(set, { wrapper, banner: head }) : toSprite(set);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, text);
  return [dest];
}

export async function main(argv) {
  const folder = argv.filter((a, i) => !a.startsWith("--") && !/^--[^=]+$/.test(argv[i - 1] ?? ""))[0];
  const flag = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3); };
  const as = flag("as"), to = flag("to"), wrapper = flag("wrapper");
  const bad = Object.entries({ as, to, wrapper }).find(([, v]) => v?.startsWith("--"));
  if (bad) { console.error(`--${bad[0]} needs a value, not "${bad[1]}"`); process.exit(1); }
  if (!folder || !as || !to) { console.error("usage: node emit.mjs <folder> --as svg|react|sprite --to <path> [--wrapper <fn>[@module]]"); process.exit(1); }
  if (!AS.includes(as)) { console.error(`--as must be ${AS.join(", ")}, not "${as}"`); process.exit(1); }
  try {
    const written = await emit(folder, { as, to, wrapper });
    for (const p of written) console.log(p);
    for (const r of written.replaced ?? []) console.log(`replaced ${r}`);
  }
  catch (e) { console.error(e.message); process.exit(1); }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
