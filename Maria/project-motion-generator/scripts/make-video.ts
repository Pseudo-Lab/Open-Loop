// 사용: tsx scripts/make-video.ts <slug> [workers=4]  → out/<slug>/video.mp4 (무음), 루프 이음새 검사
import { spawn } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { ROOT, slugArg, loadProject, outDir, run } from "./lib";

const slug = slugArg();
const workers = Number(process.argv[3] ?? 4);
const p = await loadProject(slug);
const total = Math.round(p.timeline.duration * 60);
await rm(`${outDir(slug)}/frames`, { recursive: true, force: true });
const per = Math.ceil(total / workers);
const t0 = Date.now();
await Promise.all(Array.from({ length: workers }, (_, w) => new Promise<void>((ok, fail) => {
  const a = w * per, b = Math.min(total, a + per);
  const c = spawn("npx", ["tsx", `${ROOT}scripts/render.ts`, slug, "frames", String(a), String(b)], { stdio: "inherit" });
  c.on("close", (code) => (code === 0 ? ok() : fail(new Error(`worker ${w} failed`))));
})));
console.log(`rendered ${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
// H.264 veryfast: slow 프리셋 대비 품질 차이는 미미하고 인코딩은 2~3배 빠름
run("ffmpeg", ["-v", "error", "-y", "-framerate", "60", "-i", `${outDir(slug)}/frames/%05d.png`, "-c:v", "libx264",
  "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `${outDir(slug)}/video.mp4`]);
const first = await readFile(`${outDir(slug)}/frames/00000.png`);
const last = await readFile(`${outDir(slug)}/frames/${String(total - 1).padStart(5, "0")}.png`);
console.log(`video.mp4 ${p.timeline.duration.toFixed(2)}s · loop seam ${first.equals(last) ? "OK (first = last frame)" : "MISMATCH — first and last frames differ"}`);
