/**
 * 전체 파이프라인 한 번에: 빌드 → 스틸 → 영상 → 음악 → 리포트
 *   npm run make -- <slug>
 * 단계별로도 실행 가능: npm run build / stills / video / music -- <slug>
 */
import { ROOT, slugArg, loadProject, outDir, run } from "./lib";
import { readFile, writeFile } from "node:fs/promises";

const slug = slugArg();
const p = await loadProject(slug);
const step = (name: string, cmd: string, args: string[]) => { console.log(`\n▶ ${name}`); console.log(run(cmd, args).trim()); };
step("build", "npx", ["tsx", `${ROOT}scripts/build.ts`, slug]);
step("stills", "npx", ["tsx", `${ROOT}scripts/render.ts`, slug, "stills"]);
step("sheets", "python3", [`${ROOT}scripts/sheets.py`, outDir(slug)]);
step("video", "npx", ["tsx", `${ROOT}scripts/make-video.ts`, slug]);
import { existsSync } from "node:fs";
const hasTrack = existsSync(`${ROOT}music/season-track.mp3`);
if (hasTrack) step("music", "npx", ["tsx", `${ROOT}scripts/make-music.ts`, slug]);
else console.log("\n△ music: music/season-track.mp3 없음 → 음악 없이 video.mp4까지만 (music/README.md 참고)");
const music = hasTrack ? JSON.parse(await readFile(`${outDir(slug)}/music-report.json`, "utf8")) : { landing_error_ms: "-", offset: "-", full_section_at: "-", near_event: "-", end_silence: "-" };
const md = `# ${p.title}

- Length: ${p.timeline.duration.toFixed(2)}s, 1080×1350, 60fps
- Sting landing: ${p.music.hit.toFixed(2)}s (error ${music.landing_error_ms}ms), track starts at ${music.offset}s, full section at ${music.full_section_at}s (${music.near_event})
- Loop end silent: ${music.end_silence}

## Timeline
| # | scene | from→to | shown for | note |
|---|---|---|---|---|
${p.timeline.segments.map((s, i) => `| ${i + 1} | ${s.scene} | ${s.from}→${s.to} | ${s.d.toFixed(2)}s | ${s.note} |`).join("\n")}
`;
await writeFile(`${outDir(slug)}/REPORT.md`, md);

step("guide", "npx", ["tsx", `${ROOT}scripts/guide.ts`, slug]);
step("deliver", "npx", ["tsx", `${ROOT}scripts/deliver.ts`, slug]);
console.log(`\n✔ out/${slug}: ${hasTrack ? "final.mp4, " : ""}video.mp4, review.png, phone.png, REPORT.md, GUIDE.md`);
console.log(`✔ 확인·업로드용: out/${slug}/deliver/ (<프로젝트명>_final.mp4 · _thumbnail.png · _linkedin-post.txt · _review.png)`);
