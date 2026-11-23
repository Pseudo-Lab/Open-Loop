/**
 * 프로젝트: Science Agent Leaderboard (가짜연구소 13기) · 과학 문제를 푸는 Agent를 설계 관점(정확도·도구·비용·재현성)으로 평가하는 공개 리더보드
 * 녹색 점 = 에이전트 실행(run) 한 번. 실행 카드의 상태 표시등에서 출발해 검증 관문을 모두 지나야 보드에 오른다.
 *   1. Run 클릭 → exit code 0 → "VALID." → 지표가 없음 → IN이 끼어들어 "INVALID."  (exit 0은 결과가 아니다)
 *   2. 관문 여섯 개: 과제 정의 → 독립 실행 → Agent 실행 → 스키마 검증 → 공식 지표 → 보드 반영
 *   3. 평가 기준 네 개 아래 "EVALUATE." → E·A·T가 빠져 "VALUE."  (점수가 아니라 설계의 가치)
 *   4. 지금까지(체크 4개) → 다음 단계(3개)
 *   5. 점이 화면을 덮어 다크 → "SEARCH." → RE가 끼어들어 "RESEARCH."  (AutoResearch 방향)
 *   6. 엔드카드 Science Agent *Leaderboard* (브랜드 사운드 착지) → 실행 카드로 복귀 (마지막 프레임 = 첫 프레임)
 */
import { color, size, mobile, W } from "../../engine/tokens";
import { spring, SNAPPY, BOUNCY, clamp, lerp, prog, easeIn, easeOut, easeInOut } from "../../engine/spring";
import { buildMorph, glyphXs, type Glyph } from "../../engine/morph";
import { type Ctx, type Pt, REF, f, fs, fi, mix, rgba, grain, glyph, rrect, circle, line, cw, dotGrid, cursor, wordmark, drawLogo } from "../../engine/draw";

export const SOURCE = 18.6;
export const COPY = {
  runTitle: "Agent run #01", runBtn: "Run",
  logs: ["exit code 0", "output written", "metrics: missing"],
  valid: "VALID", invalid: "INVALID",
  hookCap: ["Exit 0 isn’t a result.", "No metric, no rank."],
  pipeHead: "Rank agents, not models.",
  pipe: ["Define the task", "Isolate the run", "Run the agent", "Validate the schema", "Check the metric", "Publish to the board"],
  pipeCap: "Only fully checked runs reach the board.",
  evalLabel: "What we evaluate",
  criteria: ["Correctness", "Tool use", "Cost", "Reproducibility"],
  evaluate: "EVALUATE", value: "VALUE",
  evalCap: ["Not just the answer.", "The design behind it."],
  builtHead: "Built so far", built: ["Public challenge", "Evaluation framework", "Isolated run pipeline", "Leaderboard MVP"],
  nextHead: "Next", next: ["More science tasks & models", "Multi-agent benchmarks", "Autonomous research agents"],
  search: "SEARCH", research: "RESEARCH",
  searchCap: ["Next: from agents that search", "to agents that research."],
  title: "Science Agent", titleItalic: "Leaderboard",
  chip: "Pseudo Lab", info: "Season 13", cta: "Link in post ↓",
};

// ── 레이아웃 ──
const CARD = { x: 90, y: 360, w: 900, h: 330 };
const LIGHT: Pt & { r: number } = { x: 162, y: 425, r: 13 };   // 실행 카드의 상태 표시등 = 녹색 점의 출발점
const TITLE = { x: 196, base: 440, size: 44 };
const BTN = { x: 790, y: 392, w: 144, h: 64 };
const LOG_X = 196, LOG_Y = [530, 590, 650], LOG_SIZE = mobile.sub;
const CURSOR_REST: Pt = { x: 860, y: 1130 };
const BIG = 128;                       // 말장난 글자 크기
const HOOK_BASE = 930;
const PIPE_X = 170, PIPE_Y = (i: number) => 430 + i * 112, PIPE_T0 = 4.6, PIPE_DT = 0.4, PIPE_MOVE = 0.32;
const EVAL_BASE = 820;
const ITEM_X = 130, BUILT_Y = (i: number) => 400 + i * 80, NEXT_Y = (i: number) => 880 + i * 80;
const PROG_T0 = 10.05, PROG_DT = 0.34, PROG_MOVE = 0.28, NEXT_HOPS = [11.4, 11.95, 12.45], NEXT_MOVE = 0.32;
const SEARCH_BASE = 700;
const LOGO: Pt = { x: 540, y: 380 }, LOGO_S = 3.6;
const T = { dark: 13.48, logo: 15.5, endOut: 17.4, light: [17.62, 17.9], back: [17.9, 18.4] } as const;
/** 홀드 지점 (timeline.ts의 홀드와 같은 원본 시각): 이 근처에서 점이 영상 시간 기준으로 숨쉬듯 움직임 */
const HOLDS = [2.25, 3.8, 7.0, 8.15, 9.4, 12.95, 14.05, 15.1, 17.2];

// ── 말장난 morph ──
interface Morph { glyphs: Glyph[]; fromW: number; toW: number }
let hook: Morph, evalM: Morph, searchM: Morph;
let pipeHeadPx: number = size.displayM;
let chipRows: Array<Array<{ txt: string; x: number; w: number }>> = [];

function makeMorph(ctx: Ctx, from: string, to: string, pairs: Array<[number, number]>): Morph {
  return { glyphs: buildMorph(ctx, from, to, undefined, pairs), fromW: ctx.measureText(from).width, toW: ctx.measureText(to).width };
}

export function measure(ctx: Ctx): void {
  ctx.font = f(REF);
  hook = makeMorph(ctx, COPY.valid, COPY.invalid, [[0, 2], [1, 3], [2, 4], [3, 5], [4, 6]]);          // 앞에 IN 삽입
  evalM = makeMorph(ctx, COPY.evaluate, COPY.value, [[1, 0], [2, 1], [3, 2], [4, 3], [7, 4]]);          // E·A·T 빼기
  searchM = makeMorph(ctx, COPY.search, COPY.research, [[0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7]]); // 앞에 RE 삽입
  ctx.font = f(size.displayM);
  pipeHeadPx = Math.min(size.displayM, (size.displayM * 900) / ctx.measureText(COPY.pipeHead).width);
  ctx.font = f(40);
  chipRows = [[COPY.criteria[0], COPY.criteria[1]], [COPY.criteria[2], COPY.criteria[3]]].map((row) => {
    const ws = row.map((txt) => ctx.measureText(txt).width + 56);
    let x = (W - ws.reduce((a, b) => a + b, 0) - 24) / 2;
    return row.map((txt, i) => { const r = { txt, x, w: ws[i] }; x += ws[i] + 24; return r; });
  });
}

const mx0 = (m: Morph, px: number) => (W - (m.fromW * px) / REF) / 2;
const mx1 = (m: Morph, px: number) => (W - (m.toW * px) / REF) / 2;
const keepK = (t: number, at: number) => (t < at ? 0 : spring(t - at, SNAPPY));
/** 단어 끝 마침표 자리 (녹색 점이 앉는 곳). k = 남는 글자들의 이동 진행값 */
function period(m: Morph, px: number, base: number, k: number): Pt & { r: number } {
  const r = Math.max(9, px * 0.12);
  const a = mx0(m, px) + (m.fromW * px) / REF + r + 8, b = mx1(m, px) + (m.toW * px) / REF + r + 8;
  return { x: lerp(a, b, k), y: base - r, r };
}
interface MorphTimes { appear: number; out: number; keep: number; in: number; leave: number; up?: boolean }
function drawMorph(ctx: Ctx, t: number, m: Morph, base: number, T_: MorphTimes, fill: string, keepFill: string, inFill: string) {
  const px = BIG, x0 = mx0(m, px), x1 = mx1(m, px);
  for (const g of m.glyphs) {
    const w = cw(g.char, px, ctx);
    const li = g.toIndex ?? g.fromIndex ?? 0;
    const L = prog(t, T_.leave + li * 0.02, T_.leave + 0.25 + li * 0.02);
    const dyLeave = easeIn(L) * (T_.up ? -60 : 60);
    if (g.role === "in") {
      if (t < T_.in) continue;
      const s = Math.max(0, spring(t - T_.in - g.order * 0.08, BOUNCY));
      glyph(ctx, g.char, x1 + (g.toX! * px) / REF, base + dyLeave, f(px), inFill, 1 - L, 0, s, w);
      continue;
    }
    const st = T_.appear + g.fromIndex! * 0.03;
    if (t < st) continue;
    const s = spring(t - st, SNAPPY), a0 = prog(t, st, st + 0.12);
    if (g.role === "out") {
      const p = prog(t, T_.out + g.order * 0.04, T_.out + 0.3 + g.order * 0.04);
      glyph(ctx, g.char, x0 + (g.fromX! * px) / REF, base + (1 - s) * 40 + easeIn(p) * 110, f(px), fill, a0 * clamp(1 - p * 1.4), easeIn(p) * (g.order % 2 ? 0.45 : -0.4), 1, w);
    } else {
      const k = keepK(t, T_.keep);
      glyph(ctx, g.char, lerp(x0 + (g.fromX! * px) / REF, x1 + (g.toX! * px) / REF, k), base + (1 - s) * 40 + dyLeave, f(px), keepFill, a0 * (1 - L), 0, 1, w);
    }
  }
}
/** 한 줄 문구: st에 아래에서 올라오며 등장, out(0..1)로 퇴장 */
function text(ctx: Ctx, t: number, txt: string, x: number, y: number, st: number, out: number, fnt: string, fill: string, align: CanvasTextAlign = "center") {
  if (t < st) return;
  const k = spring(t - st, SNAPPY);
  ctx.save(); ctx.globalAlpha = clamp(prog(t, st, st + 0.15)) * (1 - out); ctx.font = fnt; ctx.fillStyle = fill; ctx.textAlign = align;
  ctx.fillText(txt, x, y + (1 - k) * 24); ctx.restore();
}
function tick(ctx: Ctx, c: Pt, s: number, stroke: string, w: number) {
  ctx.beginPath(); ctx.moveTo(c.x - 0.55 * s, c.y); ctx.lineTo(c.x - 0.15 * s, c.y + 0.4 * s); ctx.lineTo(c.x + 0.6 * s, c.y - 0.45 * s);
  ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
}
function cross(ctx: Ctx, c: Pt, s: number, stroke: string, w: number) {
  line(ctx, { x: c.x - 0.45 * s, y: c.y - 0.45 * s }, { x: c.x + 0.45 * s, y: c.y + 0.45 * s }, stroke, w);
  line(ctx, { x: c.x + 0.45 * s, y: c.y - 0.45 * s }, { x: c.x - 0.45 * s, y: c.y + 0.45 * s }, stroke, w);
}

// ── 장면 1: 실행 카드 → VALID. → INVALID. ──
const HOOK_T: MorphTimes = { appear: 1.55, out: 99, keep: 2.65, in: 2.75, leave: 3.85, up: true };
const hookPeriod = (t: number) => period(hook, BIG, HOOK_BASE, keepK(t, HOOK_T.keep));
function sceneHook(ctx: Ctx, t: number) {
  const back = t >= T.back[0];
  if (!back && t >= 4.2) return;
  const ret = back ? easeOut(prog(t, T.back[0] + 0.05, T.back[0] + 0.4)) : 1;
  const out = back ? 0 : prog(t, 3.85, 4.1);
  const cardA = ret * (1 - out);
  // 카드 + 제목 + Run 버튼 (상태 표시등은 녹색 점이 직접 그림)
  ctx.save(); ctx.globalAlpha = cardA;
  ctx.translate(0, (1 - ret) * 30);
  rrect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, 30); ctx.fillStyle = color.n50; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = rgba(color.navy, 0.1); ctx.stroke();
  ctx.font = f(TITLE.size); ctx.fillStyle = color.navy; ctx.fillText(COPY.runTitle, TITLE.x, TITLE.base);
  const press = !back && t >= 0.8 && t < 1.0 ? (t < 0.9 ? prog(t, 0.8, 0.9) : 1 - prog(t, 0.9, 1.0)) : 0;
  const used = back ? 0 : prog(t, 0.95, 1.2);
  const bs = 1 - press * 0.06;
  ctx.save(); ctx.translate(BTN.x + BTN.w / 2, BTN.y + BTN.h / 2); ctx.scale(bs, bs);
  rrect(ctx, -BTN.w / 2, -BTN.h / 2, BTN.w, BTN.h, BTN.h / 2); ctx.fillStyle = mix(color.navy, "#C9CCC6", used); ctx.fill();
  ctx.font = fs(34, 500); ctx.fillStyle = color.n50; ctx.textAlign = "center"; ctx.fillText(COPY.runBtn, 0, 12);
  ctx.restore();
  ctx.restore();
  // 실행 로그: 두 줄은 체크, 세 번째 줄(지표 없음)은 엑스
  if (!back) {
    const starts = [1.05, 1.3, 2.3];
    COPY.logs.forEach((txt, i) => {
      const st = starts[i];
      if (t < st) return;
      const k = spring(t - st, SNAPPY), a = clamp(prog(t, st, st + 0.15)) * (1 - out);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - k) * 18);
      const c = { x: LIGHT.x, y: LOG_Y[i] - 12 };
      if (i < 2) tick(ctx, c, 22, color.navy, 4); else cross(ctx, c, 20, color.navy, 4);
      ctx.font = fs(LOG_SIZE, i === 2 ? 600 : 400); ctx.fillStyle = i === 2 ? color.navy : rgba(color.navy, 0.72);
      ctx.fillText(txt, LOG_X, LOG_Y[i]); ctx.restore();
    });
    drawMorph(ctx, t, hook, HOOK_BASE, HOOK_T, color.navy, color.navy, color.green);
    COPY.hookCap.forEach((c, i) => text(ctx, t, c, W / 2, 1060 + i * 56, 3.3 + i * 0.12, prog(t, 3.85 + i * 0.03, 4.05 + i * 0.03), fs(38, i ? 600 : 400), i ? color.navy : rgba(color.navy, 0.78)));
  }
  // 커서: Run 버튼 클릭 후 빠짐, 복귀 때 다시 제자리로
  const target = { x: BTN.x + BTN.w / 2 + 6, y: BTN.y + BTN.h / 2 + 4 };
  let cp: Pt = CURSOR_REST, cs = 1, ca = 1;
  if (!back) {
    const m = easeInOut(prog(t, 0.3, 0.8));
    cp = { x: lerp(CURSOR_REST.x, target.x, m), y: lerp(CURSOR_REST.y, target.y, m) };
    if (t >= 0.8 && t < 1.05) cs = t < 0.9 ? lerp(1, 0.86, prog(t, 0.8, 0.9)) : lerp(0.86, 1, prog(t, 0.9, 1.05));
    if (t >= 1.1) { const p = easeInOut(prog(t, 1.1, 1.6)); cp = { x: lerp(target.x, CURSOR_REST.x + 60, p), y: lerp(target.y, CURSOR_REST.y + 140, p) }; ca = 1 - prog(t, 1.25, 1.6); }
  } else {
    const p = easeOut(prog(t, T.back[0] + 0.1, T.back[0] + 0.4));
    cp = { x: lerp(CURSOR_REST.x + 60, CURSOR_REST.x, p), y: lerp(CURSOR_REST.y + 140, CURSOR_REST.y, p) }; ca = p;
  }
  if (t < 1.6 || back) cursor(ctx, cp, cs, ca);
}

// ── 장면 2: 검증 관문 여섯 개 ──
const pipeReached = (i: number) => (i === 0 ? 4.45 : PIPE_T0 + (i - 1) * PIPE_DT + PIPE_MOVE);
function pipeY(t: number): number {
  let y = PIPE_Y(0);
  for (let i = 1; i < 6; i++) { const st = PIPE_T0 + (i - 1) * PIPE_DT; y += (PIPE_Y(i) - PIPE_Y(i - 1)) * easeInOut(prog(t, st, st + PIPE_MOVE)); }
  return y;
}
function scenePipe(ctx: Ctx, t: number) {
  if (t < 4.1 || t >= 7.4) return;
  const out = prog(t, 7.05, 7.3);
  text(ctx, t, COPY.pipeHead, 90, 300, 4.2, out, f(pipeHeadPx), color.navy, "left");
  const lk = easeOut(prog(t, 4.3, 4.7));
  line(ctx, { x: PIPE_X, y: PIPE_Y(0) }, { x: PIPE_X, y: lerp(PIPE_Y(0), PIPE_Y(5), lk) }, rgba(color.navy, 0.25 * (1 - out)), 3);
  // 지나온 구간은 진하게
  const y = t >= 4.45 ? pipeY(t) : PIPE_Y(0);
  if (y > PIPE_Y(0)) line(ctx, { x: PIPE_X, y: PIPE_Y(0) }, { x: PIPE_X, y }, rgba(color.navy, 0.85 * (1 - out)), 4);
  COPY.pipe.forEach((label, i) => {
    const ap = prog(t, 4.35 + i * 0.06, 4.5 + i * 0.06), done = t >= pipeReached(i) - 0.05;
    ctx.save(); ctx.globalAlpha = ap * (1 - out);
    ctx.beginPath(); ctx.arc(PIPE_X, PIPE_Y(i), 12, 0, Math.PI * 2); ctx.fillStyle = done ? color.navy : color.n100; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = color.navy; ctx.stroke();
    const hk = done ? clamp(spring(t - pipeReached(i) + 0.05, SNAPPY)) : 0;
    ctx.font = f(42); ctx.fillStyle = rgba(color.navy, lerp(0.32, 1, hk));
    ctx.fillText(label, 220 + hk * 8, PIPE_Y(i) + 14); ctx.restore();
  });
  text(ctx, t, COPY.pipeCap, 90, 1140, 6.65, out, fs(mobile.sub, 500), rgba(color.navy, 0.8), "left");
}

// ── 장면 3: 평가 기준 → EVALUATE. → VALUE. ──
const EVAL_T: MorphTimes = { appear: 7.6, out: 8.2, keep: 8.45, in: 99, leave: 9.45, up: true };
const evalPeriod = (t: number) => period(evalM, BIG, EVAL_BASE, keepK(t, EVAL_T.keep));
function sceneEval(ctx: Ctx, t: number) {
  if (t < 7.3 || t >= 9.8) return;
  const out = prog(t, 9.45, 9.7);
  text(ctx, t, COPY.evalLabel, W / 2, 330, 7.35, out, fs(mobile.sub, 500), rgba(color.navy, 0.65));
  chipRows.forEach((row, ri) => row.forEach((c, ci) => {
    const st = 7.45 + (ri * 2 + ci) * 0.08;
    if (t < st) return;
    const k = spring(t - st, SNAPPY), cy = 440 + ri * 100;
    ctx.save(); ctx.globalAlpha = clamp(prog(t, st, st + 0.15)) * (1 - out);
    ctx.translate(c.x + c.w / 2, cy + (1 - k) * 24); ctx.scale(lerp(0.9, 1, clamp(k)), lerp(0.9, 1, clamp(k)));
    rrect(ctx, -c.w / 2, -38, c.w, 76, 38); ctx.fillStyle = color.chip; ctx.fill();
    ctx.font = f(40); ctx.fillStyle = color.navy; ctx.textAlign = "center"; ctx.fillText(c.txt, 0, 14); ctx.restore();
  }));
  drawMorph(ctx, t, evalM, EVAL_BASE, EVAL_T, color.navy, mix(color.navy, color.green, prog(t, 8.5, 8.8)), color.green);
  COPY.evalCap.forEach((c, i) => text(ctx, t, c, W / 2, 960 + i * 56, 8.9 + i * 0.12, prog(t, 9.45 + i * 0.03, 9.65 + i * 0.03), fs(38, i ? 600 : 400), i ? color.navy : rgba(color.navy, 0.78)));
}

// ── 장면 4: 지금까지 / 다음 ──
const progReached = (i: number) => (i === 0 ? 10.0 : PROG_T0 + (i - 1) * PROG_DT + PROG_MOVE);
const ITEMS: Pt[] = [...COPY.built.map((_, i) => ({ x: ITEM_X, y: BUILT_Y(i) })), ...COPY.next.map((_, i) => ({ x: ITEM_X, y: NEXT_Y(i) }))];
function progPos(t: number): Pt {
  let y = ITEMS[0].y;
  for (let i = 1; i < 4; i++) { const st = PROG_T0 + (i - 1) * PROG_DT; y += (ITEMS[i].y - ITEMS[i - 1].y) * easeInOut(prog(t, st, st + PROG_MOVE)); }
  let x = ITEM_X;
  NEXT_HOPS.forEach((hs, j) => {
    const k = prog(t, hs, hs + NEXT_MOVE);
    y += (ITEMS[4 + j].y - ITEMS[3 + j].y) * easeInOut(k);
    x -= Math.sin(Math.PI * k) * (j === 0 ? 46 : 30);   // 다음 단계로는 살짝 바깥으로 돌아서 건너감
  });
  return { x, y };
}
function sceneProg(ctx: Ctx, t: number) {
  if (t < 9.65 || t >= T.dark) return;
  text(ctx, t, COPY.builtHead, 90, 300, 9.75, 0, f(size.displayM), color.navy, "left");
  COPY.built.forEach((label, i) => {
    const ap = prog(t, 9.8 + i * 0.06, 9.95 + i * 0.06), done = t >= progReached(i) - 0.05;
    const p = ITEMS[i];
    ctx.save(); ctx.globalAlpha = ap;
    ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.fillStyle = done ? color.navy : color.n100; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = color.navy; ctx.stroke();
    ctx.font = fs(40); ctx.fillStyle = rgba(color.navy, done ? 1 : 0.35); ctx.fillText(label, 180, p.y + 14); ctx.restore();
    // 점이 떠난 뒤 체크가 남음
    const leftAt = i < 3 ? PROG_T0 + i * PROG_DT + 0.08 : NEXT_HOPS[0] + 0.08;
    if (t >= leftAt) { ctx.save(); ctx.globalAlpha = prog(t, leftAt, leftAt + 0.12); tick(ctx, p, 14, color.n50, 3.5); ctx.restore(); }
  });
  text(ctx, t, COPY.nextHead, 90, 790, 11.15, 0, f(size.displayM), color.navy, "left");
  COPY.next.forEach((label, i) => {
    const st = 11.25 + i * 0.08, p = ITEMS[4 + i];
    if (t < st) return;
    const k = spring(t - st, SNAPPY);
    ctx.save(); ctx.globalAlpha = clamp(prog(t, st, st + 0.15)); ctx.translate(0, (1 - k) * 20);
    ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.setLineDash([5, 6]); ctx.lineWidth = 3; ctx.strokeStyle = color.navy; ctx.stroke(); ctx.setLineDash([]);
    ctx.font = fs(40); ctx.fillStyle = rgba(color.navy, 0.85); ctx.fillText(label, 180, p.y + 14); ctx.restore();
  });
}

// ── 장면 5: SEARCH. → RESEARCH. (다크) ──
const SEARCH_T: MorphTimes = { appear: 13.55, out: 99, keep: 14.1, in: 14.2, leave: 15.1, up: true };
const searchPeriod = (t: number) => period(searchM, BIG, SEARCH_BASE, keepK(t, SEARCH_T.keep));
function sceneSearch(ctx: Ctx, t: number, dot: Pt) {
  if (t < T.dark || t >= 15.45) return;
  dotGrid(ctx, 0.1 * prog(t, 13.6, 14.0) * (1 - prog(t, 15.1, 15.4)), color.n100, dot, 3.2);
  drawMorph(ctx, t, searchM, SEARCH_BASE, SEARCH_T, color.n100, color.n100, color.green);
  COPY.searchCap.forEach((c, i) => text(ctx, t, c, W / 2, 850 + i * 56, 14.6 + i * 0.12, prog(t, 15.1 + i * 0.03, 15.3 + i * 0.03), fs(38, i ? 600 : 400), i ? color.n50 : rgba(color.n50, 0.82)));
}

// ── 장면 6: 엔드카드 ──
function sceneEnd(ctx: Ctx, t: number) {
  if (t < T.logo || t >= T.endOut + 0.3) return;
  const outP = (o: number) => prog(t, T.endOut + o * 0.006, T.endOut + 0.22 + o * 0.006);
  const star = Math.max(0, spring(t - T.logo, BOUNCY)) * (1 - easeIn(prog(t, T.endOut, T.endOut + 0.22)));
  drawLogo(ctx, LOGO, LOGO_S * star, color.n100);
  const row = (txt: string, y: number, px: number, st: number, o: number, fnt: (p: number) => string, fill: string) => {
    ctx.font = fnt(px);
    const xs = glyphXs(ctx, txt), x = (W - ctx.measureText(txt).width) / 2;
    [...txt].forEach((ch, i) => {
      const s = st + i * 0.02, k = spring(t - s, SNAPPY), p = outP(o + i);
      glyph(ctx, ch, x + xs[i], y + (1 - k) * 60 + easeIn(p) * 60, fnt(px), fill, prog(t, s, s + 0.15) * (1 - p), 0, 1, 0);
    });
  };
  row(COPY.title, 710, 92, T.logo + 0.35, 0, f, color.n100);
  row(COPY.titleItalic, 840, 112, T.logo + 0.45, 14, fi, color.green);
  if (t >= T.logo + 0.8) {
    const ck = spring(t - T.logo - 0.8, SNAPPY);
    ctx.save(); ctx.globalAlpha = prog(t, T.logo + 0.8, T.logo + 0.95) * (1 - outP(30));
    ctx.font = f(mobile.chip); const w = ctx.measureText(COPY.chip).width;
    ctx.translate(W / 2, 955 + (1 - ck) * 30); ctx.scale(lerp(0.9, 1, clamp(ck)), lerp(0.9, 1, clamp(ck)));
    ctx.fillStyle = color.chip; ctx.fillRect(-w / 2 - 28, -38, w + 56, 76);
    ctx.fillStyle = color.navy; ctx.textAlign = "center"; ctx.fillText(COPY.chip, 0, 14); ctx.restore();
  }
  text(ctx, t, COPY.info, W / 2, 1070, T.logo + 0.9, outP(32), fs(mobile.info), rgba(color.n50, 0.82));
  text(ctx, t, COPY.cta, W / 2, 1215, T.logo + 1.05, outP(34), fs(mobile.cta), color.n50);
}

// ── 녹색 점: 하나의 오브젝트 (상태 표시등 → 마침표 → 관문 → 마침표 → 체크리스트 → 화면 덮기 → 마침표 → 로고 → 다시 표시등) ──
const arc = (a: Pt, b: Pt, k: number, h: number): Pt => ({ x: lerp(a.x, b.x, easeInOut(k)), y: lerp(a.y, b.y, easeInOut(k)) - Math.sin(Math.PI * k) * h });
function dotState(t: number): Pt & { r: number } {
  if (t < 0.95) return LIGHT;
  if (t < 1.55) return { ...LIGHT, r: LIGHT.r * (1 + 0.22 * Math.sin((2 * Math.PI * (t - 0.95)) / 0.3)) };   // 실행 중: 깜빡임
  if (t < 4.0) {
    const P = hookPeriod(t), k = prog(t, 1.55, 2.05);
    return k < 1 ? { ...arc(LIGHT, P, k, 200), r: lerp(LIGHT.r, P.r, easeOut(k)) } : P;
  }
  if (t < 7.3) {
    const first = { x: PIPE_X, y: PIPE_Y(0) };
    if (t < 4.45) { const A = hookPeriod(4.0), k = prog(t, 4.0, 4.45); return { ...arc(A, first, k, 140), r: lerp(A.r, 16, k) }; }
    return { x: PIPE_X, y: pipeY(t), r: 16 };
  }
  if (t < 9.6) {
    if (t < 7.75) { const A = { x: PIPE_X, y: PIPE_Y(5) }, P = evalPeriod(7.75), k = prog(t, 7.3, 7.75); return { ...arc(A, P, k, 260), r: lerp(16, P.r, k) }; }
    return evalPeriod(t);
  }
  if (t < T.dark) {
    if (t < 10.0) { const A = evalPeriod(9.6), k = prog(t, 9.6, 10.0); return { ...arc(A, ITEMS[0], k, 160), r: lerp(A.r, 16, k) }; }
    const p = progPos(t);
    return { ...p, r: t < 13.0 ? 16 : lerp(16, 1300, easeIn(prog(t, 13.0, T.dark))) };
  }
  if (t < 15.1) {
    const P = searchPeriod(t), k = easeInOut(prog(t, T.dark, 13.85)), A = ITEMS[6];
    return { x: lerp(A.x, P.x, k), y: lerp(A.y, P.y, k), r: lerp(1300, P.r, k) };
  }
  if (t < T.back[0]) {
    const A = searchPeriod(15.1);
    if (t < T.logo) { const k = prog(t, 15.1, T.logo); return { ...arc(A, LOGO, k, 120), r: lerp(A.r, 16, k) }; }
    return { ...LOGO, r: 16 };
  }
  const k = prog(t, T.back[0], T.back[1]);
  return { ...arc(LOGO, LIGHT, k, 160), r: lerp(16, LIGHT.r, easeOut(k)) };
}
/** 홀드 중 대기 모션: 홀드 지점 근처에서만 1, 그 밖은 0 (루프 이음새·장면 전환에 영향 없음) */
const holdWeight = (t: number) => Math.max(0, ...HOLDS.map((h) => 1 - clamp(Math.abs(t - h) / 0.2)));

export function render(ctx: Ctx, tIn: number, video: number): void {
  const t = ((tIn % SOURCE) + SOURCE) % SOURCE;
  const dark = t >= T.dark && t < T.light[1];
  ctx.fillStyle = dark ? color.navy : color.n100; ctx.fillRect(0, 0, 1080, 1350);
  ctx.drawImage(dark ? grain.dark : grain.light, 0, 0, 1080, 1350);
  const dot = dotState(t);
  if (!dark) {
    wordmark(ctx, t < T.dark ? 1 : easeOut(prog(t, T.light[1], T.back[1])));
    sceneHook(ctx, t);
    scenePipe(ctx, t);
    sceneEval(ctx, t);
    sceneProg(ctx, t);
  } else {
    sceneSearch(ctx, t, dot);
    sceneEnd(ctx, t);
    if (t >= T.light[0]) circle(ctx, LOGO.x, LOGO.y, lerp(10, 1350, easeIn(prog(t, T.light[0], T.light[1]))), color.n100);
  }
  const breathe = 1 + 0.07 * holdWeight(t) * Math.sin((2 * Math.PI * video) / 1.5);
  circle(ctx, dot.x, dot.y, dot.r * breathe, color.green);
}
