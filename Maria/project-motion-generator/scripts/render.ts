/**
 * 사용:
 *   tsx scripts/render.ts <slug> stills            → out/<slug>/stills/*.png + review.png + phone.png
 *   tsx scripts/render.ts <slug> frames <a> <b>    → out/<slug>/frames/a..b-1 (make-video가 병렬로 호출)
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { CHROME, slugArg, outDir } from "./lib";

const slug = slugArg();
const [mode = "stills", a, b] = process.argv.slice(3);
const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(`file://${outDir(slug)}/render.html`);
await page.evaluate(() => window.filmReady);
const shot = async (t: number) => {
  const url = await page.evaluate((tt) => { window.seek(tt); return (document.getElementById("stage") as HTMLCanvasElement).toDataURL("image/png"); }, t);
  return Buffer.from(url.split(",")[1], "base64");
};
if (mode === "frames") {
  const fps = await page.evaluate(() => window.FPS);
  await mkdir(`${outDir(slug)}/frames`, { recursive: true });
  for (let i = Number(a); i < Number(b); i++) await writeFile(`${outDir(slug)}/frames/${String(i).padStart(5, "0")}.png`, await shot(i / fps));
} else {
  const stills = await page.evaluate(() => window.STILLS);
  await mkdir(`${outDir(slug)}/stills`, { recursive: true });
  for (const [name, t] of Object.entries(stills)) await writeFile(`${outDir(slug)}/stills/${name}.png`, await shot(t));
  console.log(`stills: ${Object.keys(stills).join(", ")}`);
}
await browser.close();
