// 사용: tsx scripts/make-music.ts <slug>  → 시즌 곡 정렬 + 키 맞춘 sting + 믹스 → out/<slug>/final.mp4 + 음향 리포트
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { ROOT, slugArg, loadProject, outDir, run } from "./lib";

const slug = slugArg();
const p = await loadProject(slug);
if (!existsSync(`${ROOT}music/season.json`)) throw new Error("music/season.json 없음: python3 scripts/analyze-music.py music/season-track.mp3 먼저 실행");
const m = JSON.parse(await readFile(`${ROOT}music/season.json`, "utf8"));
const dur = p.timeline.duration, hit = p.music.hit;

const auto = JSON.parse(run("python3", [`${ROOT}scripts/align-music.py`, String(hit), String(dur), JSON.stringify(p.music.events)], { quiet: true }).trim().split("\n").pop()!);
const align = p.music.offset === undefined ? auto : { ...auto, offset: p.music.offset, pinned: true, auto_offset: auto.offset };
// sting: 프로젝트가 브랜드 사운드 파일을 지정하면 원본 그대로, 아니면 곡의 키·템포에 맞춰 코드로 작곡
const custom = p.music.sting;
let sting: string, preroll: number | undefined, stingKey: string;
if (custom) {
  sting = `${ROOT}${custom.file}`;
  if (!existsSync(sting)) throw new Error(`브랜드 sting 파일 없음: ${custom.file} (music/README.md 참고)`);
  preroll = custom.landing ?? Number(run("python3", [`${ROOT}scripts/sting-landing.py`, sting], { quiet: true }).trim().split("\n").pop());
  stingKey = `file ${custom.file} (original pitch, landing ${preroll}s into file)`;
} else {
  sting = `${ROOT}.build/sting_${m.sting_semitones}_${m.bpm}.wav`;
  if (!existsSync(sting)) run("npx", ["tsx", `${ROOT}scripts/render-sting.ts`, String(m.sting_semitones), String(m.bpm), sting]);
  stingKey = `${m.sting_semitones} semitones`;
}
const final = `${outDir(slug)}/final.mp4`;
run("npx", ["tsx", `${ROOT}scripts/mix-track.ts`, `${outDir(slug)}/video.mp4`, `${ROOT}${m.file}`, String(align.offset), sting, String(m.bpm), String(hit), final,
  ...(preroll !== undefined ? [String(preroll)] : [])]);

// 검수: 음량, 트루피크, 착지 오차, 루프 지점 무음
// ebur128 결과는 stderr로 나옴
const ebu = spawnSync("ffmpeg", ["-hide_banner", "-i", final, "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const report = run("python3", ["-c", `
import subprocess, numpy as np, re, json
raw=subprocess.run(['ffmpeg','-v','error','-i','${final}','-ac','1','-ar','1000','-f','f32le','-'],capture_output=True).stdout
a=np.abs(np.frombuffer(raw,dtype=np.float32)); h=int(${hit}*1000)
w=a[h-100:h+100]
print(json.dumps({"landing_error_ms": int(np.argmax(w>0.5*w.max()))-100, "end_silence": float(a[-30:].max())<1e-3}))`], { quiet: true });
const lufs = /I:\s+(-?[\d.]+) LUFS/.exec(ebu.split("Summary").pop() ?? "")?.[1];
const tp = /Peak:\s+(-?[\d.]+) dBFS/.exec(ebu.split("Summary").pop() ?? "")?.[1];
const r = { ...align, ...JSON.parse(report), lufs: Number(lufs), true_peak_db: Number(tp), sting_key: stingKey, bpm: m.bpm };
await writeFile(`${outDir(slug)}/music-report.json`, JSON.stringify(r, null, 1));
console.log("music:", JSON.stringify(r));
