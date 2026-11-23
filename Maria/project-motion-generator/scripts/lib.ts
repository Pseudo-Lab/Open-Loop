import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import type { Project } from "../engine/project";

export const ROOT = new URL("..", import.meta.url).pathname;
export const CHROME = [
  "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome",
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
].find(existsSync); // 없으면 playwright 기본 브라우저 사용

export function slugArg(): string {
  const slug = process.argv[2];
  if (!slug || !existsSync(`${ROOT}projects/${slug}/project.ts`)) {
    throw new Error(`usage: <script> <project-slug>  (projects/<slug>/project.ts must exist)`);
  }
  return slug;
}
export async function loadProject(slug: string): Promise<Project> {
  return (await import(`${ROOT}projects/${slug}/project.ts`)).default as Project;
}
export function run(cmd: string, args: string[], opts: { quiet?: boolean } = {}): string {
  const r = spawnSync(cmd, args, { encoding: "utf8", stdio: opts.quiet ? "pipe" : ["ignore", "pipe", "inherit"], maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`${cmd} ${args.slice(0, 3).join(" ")}… failed\n${r.stderr ?? ""}`);
  return r.stdout ?? "";
}
export const outDir = (slug: string) => `${ROOT}out/${slug}`;
