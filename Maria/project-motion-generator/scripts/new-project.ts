// 사용: npm run new -- <slug>  → projects/_template 을 복사해 새 프로젝트 시작
import { cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { ROOT } from "./lib";
const slug = process.argv[2];
if (!slug || !/^[a-z0-9-]+$/.test(slug)) throw new Error("usage: npm run new -- <slug> (소문자, 숫자, -)");
if (existsSync(`${ROOT}projects/${slug}`)) throw new Error(`projects/${slug} already exists`);
await cp(`${ROOT}projects/_template`, `${ROOT}projects/${slug}`, { recursive: true });
console.log(`projects/${slug} created. Next: edit film.ts (scenes), timeline.ts (pacing), project.ts (copy, stills, music.hit)`);
