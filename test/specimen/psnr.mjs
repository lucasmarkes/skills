// PSNR between two images, in dB, measured by ffmpeg.
import { execFile, execFileSync } from "node:child_process";

export const FFMPEG = (() => { try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); return true; } catch { return false; } })();

export function psnr(a, b) {
  return new Promise((ok, fail) => execFile("ffmpeg", ["-hide_banner", "-i", a, "-i", b, "-lavfi", "psnr", "-f", "null", "-"], (err, _out, log) => {
    const m = /average:(inf|[\d.]+)/.exec(log);
    if (!m) return fail(err ?? new Error(log.slice(-400)));
    ok(m[1] === "inf" ? Infinity : Number(m[1]));
  }));
}
