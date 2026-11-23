/**
 * 전달용 폴더: 사용자가 확인·업로드할 파일만 한 곳에 모음 (복사본이라 폴더째 공유·압축 가능)
 *   out/<slug>/deliver/  (파일 이름 앞에 <프로젝트명>_ 이 붙음)
 *     final.mp4          최종 영상 (음악 없으면 final-silent.mp4)
 *     thumbnail.png      커스텀 썸네일 = 엔드카드 스틸
 *     linkedin-post.txt  링크드인 포스트 초안 (projects/<slug>/linkedin-post.txt)
 *     review.png         검토용 스틸 시트
 * 사용: tsx scripts/deliver.ts <slug>  (npm run make 마지막 단계에서 자동 실행)
 */
import { existsSync } from "node:fs";
import { copyFile, mkdir, rm } from "node:fs/promises";
import { ROOT, slugArg, outDir, loadProject } from "./lib";

const slug = slugArg();
const p = await loadProject(slug);
const out = outDir(slug), dir = `${out}/deliver`;
// 파일 이름 앞에 프로젝트 이름: 폴더 밖으로 옮기거나 여러 프로젝트를 함께 받아도 구분됨 (예: Science-Agent-Leaderboard_final.mp4)
const prefix = p.title.trim().replace(/[^A-Za-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "");
await rm(dir, { recursive: true, force: true }); // 이전 결과가 섞이지 않게 매번 새로 만듦
await mkdir(dir, { recursive: true });

/** 원본 이름 → 사용자가 이름을 바꾼 경우(<prefix>_원본) 순서로 찾음. 원본이 있으면 항상 최신 렌더가 우선 */
const either = (folder: string, name: string) => [`${folder}/${name}`, `${folder}/${prefix}_${name}`];
const items: Array<[string, string[]]> = [
  ["final.mp4", either(out, "final.mp4")],
  ["thumbnail.png", either(`${out}/stills`, "end-card.png")],
  ["linkedin-post.txt", either(`${ROOT}projects/${slug}`, "linkedin-post.txt")],
  ["review.png", either(out, "review.png")],
];
// 음악이 없는 렌더(시즌 곡 없음)일 때만 무음 영상으로 대체. 이름만 바뀐 final이 있으면 그걸 씀
if (!items[0][1].some((s) => existsSync(s))) items[0] = ["final-silent.mp4", either(out, "video.mp4")];
for (const [name, sources] of items) {
  const src = sources.find((s) => existsSync(s));
  if (!src) { console.log(`△ ${name}: 없음 (${sources.map((s) => s.replace(ROOT, "")).join(" 또는 ")})`); continue; }
  await copyFile(src, `${dir}/${prefix}_${name}`);
  console.log(`✔ ${prefix}_${name} ← ${src.replace(ROOT, "")}`);
}
console.log(`전달 폴더: out/${slug}/deliver/`);
