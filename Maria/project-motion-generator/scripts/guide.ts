/**
 * 사용: tsx scripts/guide.ts <slug>  → out/<slug>/GUIDE.md (영상 해설서)
 * 한눈에 보기 → 장면별 해설 → 말장난 해설 → 키워드 해설.
 * 영어가 익숙하지 않은 사람도 영상을 이해할 수 있게, 결과물과 함께 전달한다.
 * 시간은 timeline에서 계산하므로 속도를 바꿔도 자동으로 맞는다.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { slugArg, loadProject, outDir } from "./lib";

const slug = slugArg();
const p = await loadProject(slug);
const tl = p.timeline;
const sec = (x: number) => `${x.toFixed(1)}초`;
const span = (s: { scene?: string; from: number; to: number }) =>
  [tl.unwarp(s.scene ?? "film", s.from, "last"), tl.unwarp(s.scene ?? "film", s.to, "first")] as const;
const firstSentence = (t: string) => t.split(/(?<=[.다])\s/)[0];

const overview = p.scenes.map((s, i) => {
  const [a, b] = span(s);
  return `| ${i + 1} | ${sec(a)} – ${sec(b)} | ${s.name} | ${firstSentence(s.meaning)} |`;
}).join("\n");

const scenes = p.scenes.map((s, i) => {
  const [a, b] = span(s);
  const wps = p.wordplays.filter((w) => w.at >= a - 0.01 && w.at <= b + 0.01);
  const gls = (p.glossary ?? []).filter((g) => s.name.includes(g.scene.split(" ")[0]) || g.scene.includes(s.name));
  const refs = [
    ...wps.map((w) => `말장난 「${w.from} → ${w.to}」`),
    ...gls.map(() => "키워드 해설"),
  ];
  return `### ${i + 1}. ${s.name} (${sec(a)} – ${sec(b)})

- **화면:** ${s.screen}
- **의미:** ${s.meaning}${refs.length ? `\n- **아래 참고:** ${refs.join(" · ")}` : ""}
`;
}).join("\n");

const wordplays = p.wordplays.map((w, i) => `### ${i + 1}. ${w.from} → ${w.to}
**장면:** ${w.scene} (영상 약 ${Math.round(w.at)}초)

**화면에서 일어나는 일:** ${w.how}

| 단어 | 읽기 | 뜻 |
|---|---|---|
${w.words.map((x) => `| ${x.word} | ${x.reading ?? ""} | ${x.meaning} |`).join("\n")}

**그래서 무슨 뜻인가:** ${w.meaning}

**이 프로젝트와의 연결:** ${w.why}
${w.note ? `\n> 💡 ${w.note}\n` : ""}`).join("\n");

const glossary = (p.glossary ?? []).map((g) => `### ${g.scene}

${g.summary}

| 키워드 | 읽기 | 뜻 | 다루는 주차 |
|---|---|---|---|
${g.terms.map((x) => `| ${x.term} | ${x.reading ?? ""} | ${x.meaning} | ${x.where ?? ""} |`).join("\n")}
`).join("\n");

const md = `# ${p.title}: 영상 해설서

길이 ${sec(tl.duration)} · 1080×1350 · 루프 재생. 영어가 익숙하지 않아도 영상을 이해할 수 있도록 장면, 말장난, 키워드를 풀어 설명합니다.

## 한눈에 보기
| # | 시간 | 장면 | 요약 |
|---|---|---|---|
${overview}

## 장면별 해설
${scenes}
## 말장난 해설
${wordplays}
${glossary ? `## 키워드 해설\n${glossary}` : ""}`;

await mkdir(outDir(slug), { recursive: true });
await writeFile(`${outDir(slug)}/GUIDE.md`, md);
console.log(`GUIDE.md: ${p.scenes.length} scenes, ${p.wordplays.length} wordplays, ${(p.glossary ?? []).reduce((n, g) => n + g.terms.length, 0)} keywords`);
