// 사용: tsx scripts/render-sting.ts <semitones> <bpm> <out.wav>  → 곡의 키·템포에 맞춘 엔딩 사운드 로고
import { build } from "esbuild";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { ROOT, CHROME } from "./lib";

const [semi, bpm, out] = process.argv.slice(2);
if (!out) throw new Error("usage: tsx scripts/render-sting.ts <semitones> <bpm> <out.wav>");
const js = (await build({ entryPoints: [`${ROOT}engine/audio/page.ts`], bundle: true, write: false, format: "iife", target: "es2020" })).outputFiles[0].text;
await mkdir(`${ROOT}.build`, { recursive: true });
await writeFile(`${ROOT}.build/audio.html`, `<!doctype html><meta charset="utf-8"><script>${js}</script>`);
const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const page = await browser.newPage();
await page.goto(`file://${ROOT}.build/audio.html`);
const r = await page.evaluate(([s, b]) => window.renderTrack("sting", -1.5, { semitones: s, bpm: b }), [Number(semi), Number(bpm)] as const);
await mkdir(dirname(out), { recursive: true });
await writeFile(out, Buffer.from(r.wav, "base64"));
await browser.close();
console.log(`sting → ${out} (+${semi} semitones, ${bpm} BPM)`);
