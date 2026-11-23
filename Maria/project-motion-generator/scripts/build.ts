// 사용: tsx scripts/build.ts <slug>  → out/<slug>/render.html (캡처용), out/<slug>/index.html (미리보기 플레이어)
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { build } from "esbuild";
import subsetFont from "subset-font";
import { ROOT, slugArg, loadProject, outDir } from "./lib";

const slug = slugArg();
const p = await loadProject(slug);
const copy = p.copy.join("") + "0123456789 ";
const faces = [
  { family: "Hepta Slab", style: "normal", weight: "100 900", src: "assets/fonts/HeptaSlab.ttf", text: copy },
  { family: "IBM Plex Sans", style: "normal", weight: "100 700", src: "assets/fonts/PlexSans-Regular.ttf", text: copy },
  { family: "Fraunces", style: "italic", weight: "100 900", src: "assets/fonts/Fraunces-Italic.ttf", text: (p.italicCopy ?? []).join("") || "a" },
];
const css = (await Promise.all(faces.map(async (fc) => {
  const buf = await subsetFont(await readFile(ROOT + fc.src), fc.text, { targetFormat: "woff2" });
  return `@font-face{font-family:"${fc.family}";font-style:${fc.style};font-weight:${fc.weight};font-display:block;src:url(data:font/woff2;base64,${buf.toString("base64")}) format("woff2")}`;
}))).join("\n");

await mkdir(`${ROOT}.build`, { recursive: true });
const entry = `${ROOT}.build/entry-${slug}.ts`;
await writeFile(entry, `import project from "../projects/${slug}/project";\nimport { boot } from "../engine/runtime";\nboot(project);\n`);
const bundle = async (e: string) =>
  (await build({ entryPoints: [e], bundle: true, write: false, format: "iife", target: "es2020", minify: true })).outputFiles[0].text;
const film = await bundle(entry);
const player = await bundle(`${ROOT}engine/player.ts`);

const stillButtons = Object.entries(p.stills).map(([k, v]) => `<button data-v="${v.toFixed(3)}">${k}</button>`).join("");
const page = (withPlayer: boolean) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${p.title}</title>
<style>${css}
:root{--bg:#F3F1ED;--fg:#13222B;--muted:rgba(19,34,43,.62);--line:rgba(19,34,43,.16);--accent:#16A774;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0E191F;--fg:#F3F1ED;--muted:rgba(243,241,237,.62);--line:rgba(243,241,237,.18);color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0E191F;--fg:#F3F1ED;--muted:rgba(243,241,237,.62);--line:rgba(243,241,237,.18);color-scheme:dark}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font-family:"IBM Plex Sans",system-ui,sans-serif}
${withPlayer ? `main{max-width:760px;margin:0 auto;padding:24px 16px 40px;display:grid;gap:16px}
#stage{width:100%;max-height:74vh;aspect-ratio:4/5;object-fit:contain;display:block;margin:0 auto;border-radius:6px;outline:1px solid var(--line)}
.bar{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
button{font:inherit;font-size:15px;color:var(--fg);background:transparent;border:1px solid var(--line);border-radius:999px;padding:8px 16px;cursor:pointer}
button:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
#play{background:var(--fg);color:var(--bg);border-color:var(--fg);min-width:84px}
input[type=range]{flex:1;min-width:180px;accent-color:var(--accent)}#clock{font-size:14px;color:var(--muted);font-variant-numeric:tabular-nums}
h1{font-family:"Hepta Slab",Georgia,serif;font-weight:400;font-size:clamp(22px,4vw,30px);margin:0}` : "canvas{display:block}"}
</style></head><body>
${withPlayer ? `<main><h1>${p.title}</h1>
<canvas id="stage" aria-label="Animation preview"></canvas>
<div class="bar"><button id="play" aria-pressed="true">Pause</button><input id="scrub" type="range" min="0" step="0.0167" value="0" aria-label="Timeline"><span id="clock"></span></div>
<div class="bar" aria-label="Review stills">${stillButtons}</div></main>` : `<canvas id="stage"></canvas>`}
<script>${film}</script>${withPlayer ? `<script>${player}</script>` : ""}
</body></html>`;

await mkdir(outDir(slug), { recursive: true });
await writeFile(`${outDir(slug)}/render.html`, page(false));
await writeFile(`${outDir(slug)}/index.html`, page(true));
console.log(`built ${slug}: ${p.timeline.duration.toFixed(2)}s, ${Object.keys(p.stills).length} stills`);
