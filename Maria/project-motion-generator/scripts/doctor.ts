/**
 * 처음 쓰는 사람용 환경 점검: npm run doctor
 * 필요한 도구가 모두 있는지 확인하고, 없으면 설치 명령을 알려준다.
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { ROOT, CHROME } from "./lib";

type Check = { name: string; ok: boolean; fix: string; optional?: boolean };
const has = (cmd: string, args: string[]) => spawnSync(cmd, args, { encoding: "utf8" }).status === 0;
const checks: Check[] = [
  { name: "Node.js 20+", ok: Number(process.versions.node.split(".")[0]) >= 20, fix: "https://nodejs.org 에서 20 이상 설치" },
  { name: "npm 패키지", ok: existsSync(`${ROOT}node_modules/esbuild`), fix: "npm install" },
  { name: "ffmpeg", ok: has("ffmpeg", ["-version"]), fix: "macOS: brew install ffmpeg · Windows: winget install ffmpeg" },
  { name: "Python 3 + librosa/numpy/pillow", ok: has("python3", ["-c", "import librosa, numpy, PIL"]), fix: "pip install librosa numpy pillow" },
  { name: "Chromium (렌더용)", ok: !!CHROME || existsSync(chromium.executablePath()), fix: "npx playwright install chromium" },
  { name: "폰트 (assets/fonts)", ok: ["HeptaSlab.ttf", "PlexSans-Regular.ttf", "Fraunces-Italic.ttf"].every((f) => existsSync(`${ROOT}assets/fonts/${f}`)), fix: "레포를 다시 받기 (폰트는 레포에 포함)" },
  { name: "시즌 곡 music/season-track.mp3", ok: existsSync(`${ROOT}music/season-track.mp3`), fix: "music/README.md의 Pixabay 링크에서 직접 받아 저장 (레포에는 없음). 없으면 음악 없이 영상까지만 만들어짐", optional: true },
];
let fail = 0;
for (const c of checks) {
  console.log(`${c.ok ? "✔" : c.optional ? "△" : "✘"} ${c.name}${c.ok ? "" : `\n    → ${c.fix}`}`);
  if (!c.ok && !c.optional) fail++;
}
console.log(fail ? `\n${fail}개를 해결한 뒤 다시 npm run doctor` : "\n준비 완료: npm run new -- <slug> 로 시작하세요");
process.exit(fail ? 1 : 0);
