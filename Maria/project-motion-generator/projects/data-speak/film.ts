/**
 * 프로젝트: 데이터는 여전히 말하지 않는다 (Data Still Does Not Speak) · 가짜연구소 13기 인과추론팀 리딩 살롱
 * 녹색 점 = 데이터 포인트이자 문장의 마침표.
 *   1. "Data speaks." → "Data still does not speak."   (단어 삽입: 마침표 점이 그대로 따라감)
 *   2. 산점도 + 추세선 → "CAUSAL" → "CASUAL"           (U와 S가 자리를 맞바꿈: 대부분의 인과 주장은 허술하다)
 *   3. 네 가지 질문을 점이 하나씩 짚으며 내려감        (프로젝트의 핵심 방법)
 *   4. 궤도 키워드 → "QUESTIONS" → "QUEST"             (14주의 여정 = 질문의 탐험) → 밑줄이 로고 대각선으로
 *   5. 엔드카드 → 루프 복귀 (마지막 프레임 = 첫 프레임)
 */
import { color, size, mobile, W } from "../../engine/tokens";
import { spring, SNAPPY, BOUNCY, SOFT, clamp, lerp, prog, easeIn, easeOut, easeInOut } from "../../engine/spring";
import { buildMorph, glyphXs, type Glyph } from "../../engine/morph";
import { LOGO_DIAG, LOGO_STROKE } from "../../engine/logo";
import {
  type Ctx, type Pt, REF, f, fs, fi, mix, rgba, grain, glyph, circle, line, cw, dotGrid, wordmark, drawLogo, logoPt, mulberry32,
} from "../../engine/draw";

export const SOURCE = 14;
export const COPY = {
  hookFrom: "Data speaks", hookTo: "Data still does not speak",
  causal: "CAUSAL", casual: "CASUAL",
  caption: "Most data stories are casual, not causal.",
  axisX: "Ad spend", axisY: "Sales",
  qHead: ["Four questions,", "every week."],
  questions: ["What did we observe?", "What made it, and what's missing?", "How far can we claim it?", "What should we check next?"],
  qFoot: "14 weeks · reading Behavioral Data Analysis",
  words: ["CONFOUNDING", "BOOTSTRAP", "EXPERIMENTS", "DAGS", "QUESTIONS"],
  quest: "QUEST", questCap: "Every question starts a quest.",
  title: ["Data Still Does", "Not "], titleItalic: "Speak",
  chip: "Pseudo Lab", info: "14 weeks · Causal Inference Team", cta: "Link in post ↓",
};

// ── 레이아웃 ──
const HOOK_BASE = 690;
const PLOT = { x0: 170, x1: 920, y0: 330, y1: 930 };
const STAR = 21;                     // 녹색 점이 앉는 산점도 점 인덱스
const WORD_BASE = 1150;
const RAIL_X = 140, STOPS_Y = [560, 710, 860, 1010];
const QHOPS = [5.95, 6.45, 6.95, 7.45], HOP = 0.36;
const ORBIT: Pt = { x: 540, y: 640 }, ORBIT_R = 340, OMEGA = 0.5, ORBIT_SIZE = mobile.orbit;
const KN_BASE = 700, UNDER_Y = 738;
const LOGO: Pt = { x: 540, y: 380 }, LOGO_S = 3.6;
const T = { orbit: 8.75, straight: 9.75, out: 10.2, keep: 10.4, under: [10.55, 10.85], logo: 10.95, endOut: 12.95, light: [13.17, 13.45], back: [13.45, 13.9] };

// ── 측정값 (폰트 로드 후 1회) ──
let hook: Glyph[] = [], hookFromW = 0, hookToW = 0, pxHookTo = 88;
let swap: Glyph[] = [], causalW = 0;
let orbitChars: Array<{ ch: string; word: number; s: number }> = [], questCenterS = 0;
let qLine: number[] = [], qW = 0, quest: Glyph[] = [], questW = 0;
let points: Pt[] = [];

export function measure(ctx: Ctx): void {
  ctx.font = f(REF);
  // "Data " 유지 + "speak" 유지(오른쪽으로 이동) + 's' 퇴장 + "still does not " 등장
  const to = COPY.hookTo, sp = to.indexOf("speak");
  hook = buildMorph(ctx, COPY.hookFrom, to, undefined, [
    ...[0, 1, 2, 3, 4].map((i) => [i, i] as [number, number]),
    ...[0, 1, 2, 3, 4].map((i) => [5 + i, sp + i] as [number, number]),
  ]);
  hookFromW = ctx.measureText(COPY.hookFrom).width; hookToW = ctx.measureText(to).width;
  pxHookTo = Math.min(size.display2xl, (880 * REF) / hookToW);
  // CAUSAL → CASUAL: U(2)와 S(3)가 자리를 맞바꿈
  swap = buildMorph(ctx, COPY.causal, COPY.casual, undefined, [[0, 0], [1, 1], [2, 3], [3, 2], [4, 4], [5, 5]]);
  causalW = ctx.measureText(COPY.causal).width;
  qLine = glyphXs(ctx, "QUESTIONS"); qW = ctx.measureText("QUESTIONS").width;
  quest = buildMorph(ctx, "QUESTIONS", COPY.quest, undefined, [0, 1, 2, 3, 4].map((i) => [i, i] as [number, number]));
  questW = ctx.measureText(COPY.quest).width;

  ctx.font = f(ORBIT_SIZE);
  const circ = 2 * Math.PI * ORBIT_R;
  const widths = COPY.words.map((w) => ctx.measureText(w).width);
  const gap = (circ - widths.reduce((a, b) => a + b, 0)) / COPY.words.length;
  orbitChars = []; let s = 0;
  COPY.words.forEach((w, wi) => {
    const xs = glyphXs(ctx, w);
    [...w].forEach((ch, i) => orbitChars.push({ ch, word: wi, s: s + xs[i] + ctx.measureText(ch).width / 2 }));
    if (wi === COPY.words.length - 1) questCenterS = s + widths[wi] / 2;
    s += widths[wi] + gap;
  });

  // 산점도: 시드 고정 → 매번 같은 분포 (양의 상관 + 잡음)
  const rnd = mulberry32(42);
  points = Array.from({ length: 34 }, (_, i) => {
    const u = (i + 0.5) / 34 + (rnd() - 0.5) * 0.02;
    return { x: lerp(PLOT.x0 + 30, PLOT.x1 - 20, u), y: PLOT.y1 - 40 - u * 470 - (rnd() - 0.5) * 180 };
  });
}

// ── 장면 1: Data speaks → Data still does not speak ──
function hookState(t: number) {
  // k: 0 = "Data speaks", 1 = "Data still does not speak"
  let k = t < 0.75 ? 0 : spring(t - 0.75, SNAPPY);
  if (t >= 13.45) k = 0;
  const px = lerp(size.display2xl, pxHookTo, clamp(k));
  return { k, px };
}
function hookX(g: Glyph, k: number, which: "from" | "to"): number {
  const x0 = (W - (hookFromW * size.display2xl) / REF) / 2, x1 = (W - (hookToW * pxHookTo) / REF) / 2;
  const a = g.fromX !== null ? x0 + (g.fromX * size.display2xl) / REF : 0;
  const b = g.toX !== null ? x1 + (g.toX * pxHookTo) / REF : 0;
  return which === "from" ? a : which === "to" ? b : lerp(a, b, k);
}
/** 마침표(녹색 점) 위치: 마지막 유지 글자 'k' 바로 뒤 */
function period(t: number): Pt & { r: number } {
  const { k, px } = hookState(t);
  const kGlyph = hook.find((g) => g.role === "keep" && g.char === "k")!;
  const sGlyph = hook.find((g) => g.role === "out")!;
  const r = Math.max(9, px * 0.12);
  const a = hookX(sGlyph, 0, "from") + 0.5 * size.display2xl + r + 6; // 's' 다음
  const kx = lerp(hookX(kGlyph, 0, "from"), hookX(kGlyph, 0, "to"), k);
  const b = kx + 0.6 * pxHookTo + r + 6;
  return { x: lerp(a, b, k), y: HOOK_BASE - r, r };
}
function sceneHook(ctx: Ctx, t: number) {
  const { k, px } = hookState(t);
  const leave = (o: number) => prog(t, 2.6 + o * 0.012, 2.9 + o * 0.012);
  const ret = t >= 13.45 ? easeOut(prog(t, 13.5, 13.9)) : 1;
  for (const g of hook) {
    if (g.role === "out") {
      let a = 1, dy = 0, rot = 0;
      if (t >= 0.6 && t < 13.45) { const p = prog(t, 0.6, 0.88); a = 1 - p; dy = easeIn(p) * 70; rot = easeIn(p) * 0.4; }
      if (t >= 13.45) { a = ret; dy = (1 - ret) * 30; }
      glyph(ctx, g.char, hookX(g, 0, "from"), HOOK_BASE + dy, f(size.display2xl), color.navy, a, rot, 1, cw(g.char, size.display2xl, ctx));
    } else if (g.role === "keep") {
      const kk = t < 0.75 || t >= 13.45 ? 0 : spring(t - 0.75 - g.order * 0.01, SNAPPY);
      const gpx = lerp(size.display2xl, pxHookTo, clamp(kk));
      const x = lerp(hookX(g, 0, "from"), hookX(g, 0, "to"), kk);
      const p = t < 13.45 ? leave(g.toIndex!) : 0;
      const a = (1 - p) * (t >= 13.45 ? ret : 1);
      glyph(ctx, g.char, x, HOOK_BASE + easeIn(p) * 60 + (t >= 13.45 ? (1 - ret) * 30 : 0), f(gpx), color.navy, a, 0, 1, cw(g.char, gpx, ctx));
    } else if (t >= 0.95 && t < 13.45) {
      const st = 0.95 + g.order * 0.028;
      const s = spring(t - st, SNAPPY), p = leave(g.toIndex!);
      glyph(ctx, g.char, hookX(g, 1, "to"), HOOK_BASE + (1 - s) * 50 + easeIn(p) * 60, f(pxHookTo), color.navy,
        prog(t, st, st + 0.12) * (1 - p), 0, 1, cw(g.char, pxHookTo, ctx));
    }
  }
  void k; void px;
}

// ── 장면 2: 산점도 + CAUSAL → CASUAL ──
function pointPos(i: number, t: number): Pt {
  const p = points[i];
  if (t < 5.4) return p;
  const k = easeIn(prog(t, 5.4 + i * 0.006, 5.75 + i * 0.006)); // 모두 녹색 점으로 빨려 들어감
  const d = dotState(Math.min(t, 5.75));
  return { x: lerp(p.x, d.x, k), y: lerp(p.y, d.y, k) };
}
function scenePlot(ctx: Ctx, t: number) {
  if (t < 2.9 || t >= 5.9) return;
  const out = 1 - prog(t, 5.35, 5.6);
  // 축
  const ak = easeOut(prog(t, 2.9, 3.3)) * out;
  line(ctx, { x: PLOT.x0, y: PLOT.y1 }, { x: lerp(PLOT.x0, PLOT.x1, ak), y: PLOT.y1 }, rgba(color.navy, 0.5), 3);
  line(ctx, { x: PLOT.x0, y: PLOT.y1 }, { x: PLOT.x0, y: lerp(PLOT.y1, PLOT.y0, ak) }, rgba(color.navy, 0.5), 3);
  ctx.save(); ctx.globalAlpha = prog(t, 3.2, 3.45) * out; ctx.font = fs(mobile.edgeLabel, 500); ctx.fillStyle = rgba(color.navy, 0.7);
  ctx.textAlign = "right"; ctx.fillText(`${COPY.axisX} →`, PLOT.x1, PLOT.y1 + 48);
  ctx.textAlign = "left"; ctx.fillText(`↑ ${COPY.axisY}`, PLOT.x0 - 10, PLOT.y0 - 22); ctx.restore();
  // 점
  points.forEach((_, i) => {
    if (i === STAR) return;
    const st = 3.05 + i * 0.018;
    if (t < st) return;
    const p = pointPos(i, t);
    const r = 9 * Math.max(0, spring(t - st, BOUNCY));
    ctx.save(); ctx.globalAlpha = t >= 5.4 ? 1 - prog(t, 5.55, 5.75) : 1; circle(ctx, p.x, p.y, r, color.navy); ctx.restore();
  });
  // 추세선: "그럴듯한 관계"
  const lk = easeInOut(prog(t, 3.75, 4.15)) * out;
  if (lk > 0.01) {
    const a = { x: PLOT.x0 + 30, y: PLOT.y1 - 60 }, b = { x: PLOT.x1 - 10, y: PLOT.y1 - 560 };
    line(ctx, a, { x: lerp(a.x, b.x, lk), y: lerp(a.y, b.y, lk) }, rgba(color.navy, 0.85), 4);
  }
  // CAUSAL → CASUAL (U와 S가 위아래로 엇갈리며 자리 교환)
  const px = size.display2xl, x0 = (W - (causalW * px) / REF) / 2;
  for (const g of swap) {
    const i = g.fromIndex!;
    const st = 4.0 + i * 0.03;
    if (t < st) continue;
    const s = spring(t - st, SNAPPY);
    const k = t < 4.65 ? 0 : spring(t - 4.65, SNAPPY);
    const moving = g.fromIndex !== g.toIndex;
    const x = lerp(x0 + (g.fromX! * px) / REF, x0 + (g.toX! * px) / REF, k);
    const arc = moving ? Math.sin(Math.PI * clamp(k)) * 70 * (g.char === "U" ? -1 : 1) : 0;
    const p = prog(t, 5.35 + i * 0.02, 5.6 + i * 0.02);
    glyph(ctx, g.char, x, WORD_BASE + (1 - s) * 50 + arc + easeIn(p) * 60, f(px),
      moving ? mix(color.navy, color.green, prog(t, 4.65, 4.9)) : color.navy, prog(t, st, st + 0.15) * (1 - p), 0, 1, cw(g.char, px, ctx));
  }
  if (t >= 4.95) {
    const k = spring(t - 4.95, SNAPPY);
    ctx.save(); ctx.globalAlpha = clamp(prog(t, 4.95, 5.1)) * out; ctx.font = fs(mobile.sub); ctx.fillStyle = rgba(color.navy, 0.75);
    ctx.textAlign = "center"; ctx.fillText(COPY.caption, W / 2, WORD_BASE + 90 + (1 - k) * 24); ctx.restore();
  }
}

// ── 장면 3: 네 가지 질문 ──
function hopPos(t: number): Pt {
  let prev: Pt = points[STAR], pos = prev;
  QHOPS.forEach((hs, i) => {
    const tgt = { x: RAIL_X, y: STOPS_Y[i] };
    if (t >= hs) {
      const ky = spring(t - hs, { stiffness: 230, damping: 15 });
      const kx = easeInOut(prog(t, hs, hs + HOP));
      const arc = i === 0 ? Math.sin(Math.PI * prog(t, hs, hs + HOP)) * 120 : Math.sin(Math.PI * prog(t, hs, hs + HOP)) * 40;
      pos = { x: lerp(prev.x, tgt.x, kx) - (i === 0 ? 0 : arc), y: lerp(prev.y, tgt.y, ky) - (i === 0 ? arc : 0) };
    }
    prev = tgt;
  });
  return pos;
}
function sceneQuestions(ctx: Ctx, t: number) {
  if (t < 5.75 || t >= 8.45) return;
  const out = 1 - prog(t, 8.1, 8.32);
  COPY.qHead.forEach((h, i) => {
    const st = 5.85 + i * 0.1, k = spring(t - st, SNAPPY);
    ctx.save(); ctx.globalAlpha = clamp(prog(t, st, st + 0.15)) * out; ctx.font = f(size.displayXl); ctx.fillStyle = color.navy;
    ctx.fillText(h, 90, 300 + i * 84 + (1 - k) * 40); ctx.restore();
  });
  const rk = easeOut(prog(t, 5.95, 6.4)) * out;
  line(ctx, { x: RAIL_X, y: STOPS_Y[0] - 30 }, { x: RAIL_X, y: lerp(STOPS_Y[0] - 30, STOPS_Y[3] + 30, rk) }, rgba(color.navy, 0.4), 3);
  COPY.questions.forEach((q, i) => {
    const land = QHOPS[i] + HOP;
    ctx.save(); ctx.globalAlpha = prog(t, 6.0 + i * 0.08, 6.1 + i * 0.08) * out;
    ctx.beginPath(); ctx.arc(RAIL_X, STOPS_Y[i], 10, 0, Math.PI * 2);
    ctx.fillStyle = t >= land ? color.navy : color.n100; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = color.navy; ctx.stroke(); ctx.restore();
    if (t >= land - 0.05) {
      const k = spring(t - land + 0.05, SNAPPY);
      ctx.save(); ctx.globalAlpha = clamp(k) * out;
      ctx.font = fs(mobile.stepNum, 500); ctx.fillStyle = rgba(color.navy, 0.55); ctx.fillText(`0${i + 1}`, RAIL_X + 50, STOPS_Y[i] - 26 + (1 - k) * 20);
      ctx.font = f(size.headline2); ctx.fillStyle = color.navy; ctx.fillText(q, RAIL_X + 50, STOPS_Y[i] + 26 + (1 - k) * 20);
      ctx.restore();
    }
  });
  const fk = spring(t - 6.3, SNAPPY);
  ctx.save(); ctx.globalAlpha = clamp(prog(t, 6.3, 6.5)) * out; ctx.font = fs(mobile.sub); ctx.fillStyle = rgba(color.navy, 0.7);
  ctx.fillText(COPY.qFoot, 90, 1170 + (1 - fk) * 24); ctx.restore();
}

// ── 장면 4: 궤도 → QUESTIONS → QUEST ──
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const qOrigin = () => (W - (qW * size.display2xl) / REF) / 2;
const questOrigin = () => (W - (questW * size.display2xl) / REF) / 2;
function orbitGlyph(c: { s: number; word: number }, t: number) {
  const ent = spring(t - T.orbit - 0.05 - c.word * 0.05, SNAPPY);
  let r = ORBIT_R * ent;
  if (c.word !== 4 && t >= T.straight) r += easeIn(prog(t, T.straight, T.straight + 0.45)) * 700;
  const PHI0 = -Math.PI / 2 - OMEGA * 1.0 - questCenterS / ORBIT_R;
  const base = PHI0 + OMEGA * (Math.min(t, T.straight) - (T.straight - 1.0)) + OMEGA * 0.35 * easeOut(prog(t, T.straight, T.straight + 0.4));
  const th = base + c.s / ORBIT_R;
  return { x: ORBIT.x + Math.cos(th) * r, y: ORBIT.y + Math.sin(th) * r, rot: th + Math.PI / 2 };
}
function sceneOrbit(ctx: Ctx, t: number, dot: Pt) {
  if (t < T.orbit || t >= T.logo + 0.3) return;
  dotGrid(ctx, 0.1 * prog(t, T.straight + 0.1, T.straight + 0.6), color.n100, dot, 3.2);
  const px = size.display2xl;
  let qi = 0;
  for (const c of orbitChars) {
    const o = orbitGlyph(c, t);
    const w = cw(c.ch, ORBIT_SIZE, ctx);
    if (c.word !== 4) {
      const a = prog(t, T.orbit + 0.05, T.orbit + 0.3) * (1 - prog(t, T.straight + 0.05, T.straight + 0.4));
      glyph(ctx, c.ch, o.x - w / 2, o.y, f(ORBIT_SIZE), color.n100, a, o.rot, 1, w);
      continue;
    }
    const idx = qi++;
    const s = t < T.straight ? 0 : spring(t - T.straight - idx * 0.015, SOFT);
    const gpx = lerp(ORBIT_SIZE, px, s), gw = cw(c.ch, gpx, ctx);
    let x = lerp(o.x - w / 2, qOrigin() + (qLine[idx] * px) / REF, s), y = lerp(o.y, KN_BASE, s), rot = lerp(wrap(o.rot), 0, s);
    let a = prog(t, T.orbit + 0.05, T.orbit + 0.3), fill: string = color.n100;
    const g = quest.find((m) => m.fromIndex === idx)!;
    if (g.role === "out" && t >= T.out) {
      const p = prog(t, T.out + g.order * 0.03, T.out + 0.22 + g.order * 0.03);
      y -= easeIn(p) * 70; x += easeIn(p) * 60; rot += easeIn(p) * (g.order % 2 ? 0.5 : -0.4); a *= 1 - p;
    }
    if (g.role === "keep") {
      const k2 = t < T.keep ? 0 : spring(t - T.keep - g.order * 0.015, SNAPPY);
      x = lerp(x, questOrigin() + (g.toX! * px) / REF, k2);
      fill = mix(color.n100, color.green, prog(t, T.keep, T.keep + 0.25));
      if (t >= T.logo - 0.1) { const p = prog(t, T.logo - 0.1 + g.order * 0.03, T.logo + 0.15 + g.order * 0.03); y -= easeIn(p) * 80; a *= 1 - p; }
    }
    glyph(ctx, c.ch, x, y, f(gpx), fill, a, rot, 1, gw);
  }
  if (t >= T.under[0]) {
    const k = spring(t - T.under[0], SNAPPY);
    ctx.save(); ctx.globalAlpha = clamp(prog(t, T.under[0], T.under[0] + 0.15)) * (1 - prog(t, T.logo - 0.1, T.logo + 0.1));
    ctx.font = fs(mobile.sub); ctx.fillStyle = color.n50; ctx.textAlign = "center";
    ctx.fillText(COPY.questCap, W / 2, UNDER_Y + 90 + (1 - k) * 24); ctx.restore();
  }
}
function edgeSegment(t: number): [Pt, Pt] | null {
  if (t < T.under[0] || t >= T.endOut + 0.25) return null;
  const x0 = questOrigin() - 6;
  const a0 = { x: x0, y: UNDER_Y }, b0 = { x: lerp(x0, W - x0 + 6, easeInOut(prog(t, T.under[0], T.under[1]))), y: UNDER_Y };
  const da = logoPt(LOGO_DIAG.a, LOGO, LOGO_S), db = logoPt(LOGO_DIAG.b, LOGO, LOGO_S);
  const k = t < T.logo ? 0 : spring(t - T.logo, SOFT);
  let a = { x: lerp(a0.x, da.x, k), y: lerp(a0.y, da.y, k) }, b = { x: lerp(b0.x, db.x, k), y: lerp(b0.y, db.y, k) };
  if (t >= T.endOut) { const p = easeIn(prog(t, T.endOut, T.endOut + 0.25)); a = { x: lerp(a.x, LOGO.x, p), y: lerp(a.y, LOGO.y, p) }; b = { x: lerp(b.x, LOGO.x, p), y: lerp(b.y, LOGO.y, p) }; }
  return [a, b];
}

// ── 장면 5: 엔드카드 ──
function sceneEnd(ctx: Ctx, t: number) {
  if (t < T.logo || t >= T.endOut + 0.3) return;
  const outP = (o: number) => prog(t, T.endOut + o * 0.006, T.endOut + 0.22 + o * 0.006);
  const star = t < T.logo + 0.25 ? 0 : Math.max(0, spring(t - T.logo - 0.25, BOUNCY)) * (1 - easeIn(prog(t, T.endOut, T.endOut + 0.22)));
  drawLogo(ctx, LOGO, LOGO_S * star, color.n100);
  const px = size.display2xl;
  const row = (txt: string, x: number, y: number, st: number, o: number, fnt: (p: number) => string, fill: string) => {
    ctx.font = fnt(px);
    const xs = glyphXs(ctx, txt);
    [...txt].forEach((ch, i) => {
      const s = st + i * 0.016, k = spring(t - s, SNAPPY), p = outP(o + i);
      glyph(ctx, ch, x + xs[i], y + (1 - k) * 60 + easeIn(p) * 60, fnt(px), fill, prog(t, s, s + 0.15) * (1 - p), 0, 1, 0);
    });
  };
  ctx.font = f(px); const w1 = ctx.measureText(COPY.title[0]).width, w2a = ctx.measureText(COPY.title[1]).width;
  ctx.font = fi(px); const w2b = ctx.measureText(COPY.titleItalic).width;
  row(COPY.title[0], (W - w1) / 2, 790, T.logo + 0.45, 0, f, color.n100);
  const x2 = (W - w2a - w2b) / 2;
  row(COPY.title[1], x2, 890, T.logo + 0.55, 16, f, color.n100);
  row(COPY.titleItalic, x2 + w2a, 890, T.logo + 0.62, 21, fi, color.green);
  if (t >= T.logo + 0.9) {
    const ck = spring(t - T.logo - 0.9, SNAPPY);
    ctx.save(); ctx.globalAlpha = prog(t, T.logo + 0.9, T.logo + 1.05) * (1 - outP(30));
    ctx.font = f(mobile.chip); const w = ctx.measureText(COPY.chip).width;
    ctx.translate(W / 2, 1005 + (1 - ck) * 30); ctx.scale(lerp(0.9, 1, clamp(ck)), lerp(0.9, 1, clamp(ck)));
    ctx.fillStyle = color.chip; ctx.fillRect(-w / 2 - 28, -38, w + 56, 76);
    ctx.fillStyle = color.navy; ctx.textAlign = "center"; ctx.fillText(COPY.chip, 0, 14); ctx.restore();
  }
  for (const [txt, y, st, op, px_] of [[COPY.info, 1110, T.logo + 1.0, 0.82, mobile.info], [COPY.cta, 1250, T.logo + 1.15, 1, mobile.cta]] as const) {
    if (t < st) continue;
    const k = spring(t - st, SNAPPY);
    ctx.save(); ctx.globalAlpha = prog(t, st, st + 0.18) * op * (1 - outP(32)); ctx.font = fs(px_); ctx.fillStyle = color.n50; ctx.textAlign = "center";
    ctx.fillText(txt, W / 2, y + (1 - k) * 24); ctx.restore();
  }
}

// ── 녹색 점: 하나의 오브젝트 ──
function dotState(t: number): Pt & { r: number } {
  if (t < 2.65) return period(t);
  if (t < 5.9) { // 마침표 → 산점도의 한 점 (데이터 포인트)
    const P = period(2.65), Q = points[STAR], k = prog(t, 2.65, 3.15);
    return { x: lerp(P.x, Q.x, easeInOut(k)), y: lerp(P.y, Q.y, easeInOut(k)) - Math.sin(Math.PI * k) * 180, r: lerp(P.r, 13, easeOut(k)) };
  }
  if (t < 8.75) {
    const p = hopPos(t);
    let r = lerp(13, 17, prog(t, 6.0, 6.3));
    if (t >= 8.28) r = lerp(17, 1300, easeIn(prog(t, 8.28, 8.73)));
    return { ...p, r };
  }
  if (t < T.straight) {
    const k = easeInOut(prog(t, 8.75, 9.15));
    return { x: lerp(RAIL_X, ORBIT.x, k), y: lerp(STOPS_Y[3], ORBIT.y, k), r: lerp(1300, 18, k) };
  }
  const u0 = { x: questOrigin() - 6, y: UNDER_Y };
  if (t < T.under[0]) {
    const k = prog(t, T.straight + 0.3, T.under[0] - 0.05);
    return { x: lerp(ORBIT.x, u0.x, easeInOut(k)), y: lerp(ORBIT.y, u0.y, easeInOut(k)) - Math.sin(Math.PI * k) * 120, r: 18 };
  }
  const uEnd = W - u0.x;
  if (t < T.logo) return { x: lerp(u0.x, uEnd, easeInOut(prog(t, T.under[0], T.under[1]))), y: UNDER_Y, r: 18 };
  if (t < T.back[0]) {
    const k = spring(t - T.logo, SOFT);
    return { x: lerp(uEnd, LOGO.x, k), y: lerp(UNDER_Y, LOGO.y, k), r: lerp(18, 16, clamp(k)) };
  }
  const k = prog(t, T.back[0], T.back[1]), R = period(0);
  return { x: lerp(LOGO.x, R.x, easeInOut(k)), y: lerp(LOGO.y, R.y, easeInOut(k)) - Math.sin(Math.PI * k) * 160, r: lerp(16, R.r, easeOut(k)) };
}

export function render(ctx: Ctx, tIn: number): void {
  const t = ((tIn % SOURCE) + SOURCE) % SOURCE;
  const dark = t >= 8.73 && t < T.light[1];
  ctx.fillStyle = dark ? color.navy : color.n100; ctx.fillRect(0, 0, 1080, 1350);
  ctx.drawImage(dark ? grain.dark : grain.light, 0, 0, 1080, 1350);
  const dot = dotState(t);
  if (!dark) {
    wordmark(ctx, t < 8.2 ? 1 : t >= T.light[1] ? easeOut(prog(t, T.light[1], T.back[1])) : 0);
    if (t < 3.0 || t >= T.light[1]) sceneHook(ctx, t);
    scenePlot(ctx, t);
    sceneQuestions(ctx, t);
  } else {
    sceneOrbit(ctx, t, dot);
    const seg = edgeSegment(t);
    if (seg && t < T.logo + 0.65) {
      const k = prog(t, T.logo, T.logo + 0.45);
      ctx.save(); ctx.globalAlpha = 1 - prog(t, T.logo + 0.4, T.logo + 0.6);
      line(ctx, seg[0], seg[1], t < T.logo ? color.green : mix(color.green, color.n100, k), lerp(7, LOGO_STROKE * LOGO_S, k));
      ctx.restore();
    }
    sceneEnd(ctx, t);
    if (t >= T.light[0]) circle(ctx, LOGO.x, LOGO.y, lerp(10, 1350, easeIn(prog(t, T.light[0], T.light[1]))), color.n100);
  }
  if (t < 3.15 && t >= 2.65) { /* 점은 산점도로 이동 중 */ }
  if (t >= 2.9 && t < 5.9) circle(ctx, points[STAR].x, points[STAR].y, 0, color.green);
  circle(ctx, dot.x, dot.y, dot.r, color.green);
}
