/**
 * 프로젝트: OpenLoop (가짜연구소 13기) · 가짜연구소 프로젝트를 글로벌 독자에게 소개하는 Human–AI 콘텐츠 워크플로우
 * 녹색 점 = 하나의 프로젝트 이야기. 토글의 손잡이에서 출발해 루프를 한 바퀴 돌고, 영상도 처음으로 돌아온다.
 *   1. 토글 "LOCAL ONLY"를 끄면 → "GLOBAL"         (C가 빠지고 G·B가 들어옴: 한국 커뮤니티 → 글로벌)
 *   2. "OPEN SOURCE RELATIONS" → "OPENREL"          (README의 OpenRel = Open Source Relations)
 *   3. 점이 여섯 단계 루프를 한 바퀴 → 4단계 마일스톤을 뜀
 *   4. 평가 기준 궤도 → "LOOP" → "POOL"             (글자 순서가 뒤집힘: 루프가 기여자 풀을 키운다)
 *   5. 엔드카드 Open*Loop* → 토글 화면으로 복귀 (마지막 프레임 = 첫 프레임)
 */
import { color, size, mobile, W } from "../../engine/tokens";
import { spring, SNAPPY, BOUNCY, SOFT, clamp, lerp, prog, easeIn, easeOut, easeInOut } from "../../engine/spring";
import { buildMorph, glyphXs, type Glyph } from "../../engine/morph";
import { LOGO_DIAG, LOGO_STROKE } from "../../engine/logo";
import {
  type Ctx, type Pt, REF, f, fs, fi, mix, rgba, grain, glyph, rrect, circle, line, cw, dotGrid, cursor, wordmark, drawLogo, logoPt,
} from "../../engine/draw";

export const SOURCE = 18.8;
export const COPY = {
  label: "LOCAL ONLY", global: "GLOBAL",
  whyLabel: "Why OpenLoop?",
  rel: "OPEN SOURCE RELATIONS", openrel: "OPENREL",
  relCap: "Open source relations: more than translation.",
  loopHead: "One loop, six steps.",
  steps: ["Translate", "Post", "Visual", "Review", "Publish", "Contribute"],
  motto: ["Build manually.", "Standardize what works.", "Automate with purpose."],
  msHead: "15 weeks", msSub: "Every Monday · Oct 2026 – Jan 2027",
  milestones: ["BUILD", "CURATE", "DEVELOP", "SCALE"],
  msFoot: "Goal: a reusable OpenLoop Toolkit",
  words: ["ACCURACY", "CONSISTENCY", "REUSABILITY", "HUMAN REVIEW", "LOOP"],
  pool: "POOL", poolCap: "A loop that grows a contributor pool.",
  title: "Open", titleItalic: "Loop",
  chip: "Pseudo Lab", info: "15 weeks · Season 13", cta: "Link in post ↓",
};

// ── 레이아웃 ──
const ROW = { x: 90, y: 560, w: 900, h: 170 };
const LABEL = { x: ROW.x + 56, base: ROW.y + ROW.h / 2 + 15, size: size.headline1 };
const TOG = { w: 120, h: 68, cx: ROW.x + ROW.w - 56 - 60, cy: ROW.y + ROW.h / 2 };
const KNOB: Pt & { r: number } = { x: TOG.cx + TOG.w / 2 - TOG.h / 2, y: TOG.cy, r: TOG.h / 2 - 7 };
const CURSOR_REST: Pt = { x: 800, y: 1010 };
const BIG_BASE = 720;
const REL_BASE = 720;
const RING: Pt & { r: number } = { x: 540, y: 720, r: 230 };
const STEP_SIZE = 40;
const LOOP_T0 = 6.6, STEP_DT = 0.47, STEP_MOVE = 0.4;
const LINE_Y = 780, MS_X = [170, 400, 650, 900], HOPS = [10.75, 11.25, 11.75, 12.25], HOP = 0.36;
const ORBIT: Pt = { x: 540, y: 640 }, ORBIT_R = 340, OMEGA = 0.5, ORBIT_SIZE = mobile.orbit;
const KN_BASE = 700, UNDER_Y = 738;
const LOGO: Pt = { x: 540, y: 380 }, LOGO_S = 3.6;
const T = { orbit: 13.5, straight: 14.5, keep: 14.75, under: [15.3, 15.6], logo: 15.7, endOut: 17.7, light: [17.92, 18.2], back: [18.2, 18.65] };

// ── 측정값 ──
let hook: Glyph[] = [], labelW = 0, globalW = 0;
let rel: Glyph[] = [], relW = 0, relPx = 64, openrelW = 0;
let orbitChars: Array<{ ch: string; word: number; s: number }> = [], loopCenterS = 0;
let loopLine: number[] = [], loopW = 0, pool: Glyph[] = [], poolW = 0;

export function measure(ctx: Ctx): void {
  ctx.font = f(REF);
  // LOCAL ONLY → GLOBAL: L·O·A·L 유지, C와 " ONLY" 퇴장, G·B 등장
  hook = buildMorph(ctx, COPY.label, COPY.global, undefined, [[0, 1], [1, 2], [3, 4], [4, 5]]);
  labelW = ctx.measureText(COPY.label).width; globalW = ctx.measureText(COPY.global).width;
  // OPEN SOURCE RELATIONS → OPENREL: O·P·E·N + R·E·L만 남음
  rel = buildMorph(ctx, COPY.rel, COPY.openrel, undefined, [[0, 0], [1, 1], [2, 2], [3, 3], [12, 4], [13, 5], [14, 6]]);
  relW = ctx.measureText(COPY.rel).width; openrelW = ctx.measureText(COPY.openrel).width;
  relPx = Math.min(size.displayLg, (900 * REF) / relW);
  // LOOP → POOL: 글자 순서가 뒤집힘
  loopLine = glyphXs(ctx, "LOOP"); loopW = ctx.measureText("LOOP").width;
  pool = buildMorph(ctx, "LOOP", COPY.pool, undefined, [[0, 3], [1, 1], [2, 2], [3, 0]]);
  poolW = ctx.measureText(COPY.pool).width;

  ctx.font = f(ORBIT_SIZE);
  const circ = 2 * Math.PI * ORBIT_R;
  const widths = COPY.words.map((w) => ctx.measureText(w).width);
  const gap = (circ - widths.reduce((a, b) => a + b, 0)) / COPY.words.length;
  orbitChars = []; let s = 0;
  COPY.words.forEach((w, wi) => {
    const xs = glyphXs(ctx, w);
    [...w].forEach((ch, i) => orbitChars.push({ ch, word: wi, s: s + xs[i] + ctx.measureText(ch).width / 2 }));
    if (wi === COPY.words.length - 1) loopCenterS = s + widths[wi] / 2;
    s += widths[wi] + gap;
  });
}

// ── 장면 1: LOCAL ONLY 토글 → GLOBAL ──
const bigX = (g: Glyph) => (W - (globalW * size.display2xl) / REF) / 2 + (g.toX! * size.display2xl) / REF;
const rowX = (g: Glyph) => LABEL.x + (g.fromX! * LABEL.size) / REF;
function globalPeriod(): Pt & { r: number } {
  const r = Math.max(9, size.display2xl * 0.12);
  return { x: (W + (globalW * size.display2xl) / REF) / 2 + r + 8, y: BIG_BASE - r, r };
}
function sceneHook(ctx: Ctx, t: number) {
  const back = t >= T.back[0];
  const ret = back ? easeOut(prog(t, T.back[0] + 0.05, T.back[0] + 0.4)) : 0;
  // 카드 + 토글 (손잡이는 녹색 점이 직접 그림)
  const cardA = back ? ret : 1 - prog(t, 1.1, 1.4);
  const off = back ? 1 - ret : t >= 0.9 ? clamp(spring(t - 0.9, SNAPPY)) : 0;
  if (cardA > 0.001) {
    ctx.save(); ctx.globalAlpha = cardA;
    rrect(ctx, ROW.x, ROW.y, ROW.w, ROW.h, 30); ctx.fillStyle = color.n50; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(color.navy, 0.1); ctx.stroke();
    rrect(ctx, TOG.cx - TOG.w / 2, TOG.cy - TOG.h / 2, TOG.w, TOG.h, TOG.h / 2);
    ctx.fillStyle = mix(color.navy, "#C9CCC6", off); ctx.fill();
    ctx.restore();
  }
  for (const g of hook) {
    const w0 = cw(g.char, LABEL.size, ctx);
    if (back) { // 복귀: 원래 라벨이 다시 올라옴
      if (g.role === "in") continue;
      glyph(ctx, g.char, rowX(g), LABEL.base + (1 - ret) * 30, f(LABEL.size), color.navy, ret, 0, 1, w0);
      continue;
    }
    const leave = prog(t, 2.55 + (g.toIndex ?? 0) * 0.02, 2.85 + (g.toIndex ?? 0) * 0.02);
    if (g.role === "out") {
      let a = 1, dy = 0, rot = 0;
      if (t >= 0.92) { const p = prog(t, 0.92 + g.order * 0.025, 1.17 + g.order * 0.025); a = clamp(1 - p * 1.4); dy = easeIn(p) * 110; rot = easeIn(p) * (g.order % 2 ? 0.5 : -0.4); }
      glyph(ctx, g.char, rowX(g), LABEL.base + dy, f(LABEL.size), color.navy, a, rot, 1, w0);
    } else if (g.role === "keep") {
      // 모든 글자가 같은 k로 움직이고 커져야 간격이 유지됨 (글자별 시차를 주면 먼저 커진 글자가 옆 글자를 덮음)
      const k = t < 1.25 ? 0 : spring(t - 1.25, SNAPPY);
      const px = lerp(LABEL.size, size.display2xl, clamp(k));
      glyph(ctx, g.char, lerp(rowX(g), bigX(g), k), lerp(LABEL.base, BIG_BASE, k) - easeIn(leave) * 60, f(px), color.navy, 1 - leave, 0, 1, cw(g.char, px, ctx));
    } else if (t >= 1.45) {
      const s = Math.max(0, spring(t - 1.45 - g.order * 0.08, BOUNCY));
      glyph(ctx, g.char, bigX(g), BIG_BASE - easeIn(leave) * 60, f(size.display2xl), color.green, 1 - leave, 0, s, cw(g.char, size.display2xl, ctx));
    }
  }
  // 커서
  const target = { x: TOG.cx + 14, y: TOG.cy + 6 };
  let cp: Pt = CURSOR_REST, cs = 1, ca = 1;
  if (!back) {
    const m = easeInOut(prog(t, 0.25, 0.85));
    cp = { x: lerp(CURSOR_REST.x, target.x, m), y: lerp(CURSOR_REST.y, target.y, m) };
    if (t >= 0.8 && t < 1.05) cs = t < 0.9 ? lerp(1, 0.86, prog(t, 0.8, 0.9)) : lerp(0.86, 1, prog(t, 0.9, 1.05));
    if (t >= 1.1) { const p = easeInOut(prog(t, 1.1, 1.6)); cp = { x: lerp(target.x, CURSOR_REST.x + 60, p), y: lerp(target.y, CURSOR_REST.y + 140, p) }; ca = 1 - prog(t, 1.25, 1.6); }
  } else {
    const p = easeOut(prog(t, T.back[0] + 0.1, T.back[0] + 0.4));
    cp = { x: lerp(CURSOR_REST.x + 60, CURSOR_REST.x, p), y: lerp(CURSOR_REST.y + 140, CURSOR_REST.y, p) }; ca = p;
  }
  if (t < 1.6 || back) cursor(ctx, cp, cs, ca);
}

// ── 장면 2: OPEN SOURCE RELATIONS → OPENREL ──
const relX0 = () => (W - (relW * relPx) / REF) / 2;
const relX1 = () => (W - (openrelW * size.display2xl) / REF) / 2;
function relK(t: number) { return t < 4.2 ? 0 : spring(t - 4.2, SNAPPY); }
function relPeriod(t: number): Pt & { r: number } {
  const k = clamp(relK(t));
  const r0 = Math.max(9, relPx * 0.12), r1 = Math.max(9, size.display2xl * 0.12), r = lerp(r0, r1, k);
  const a = relX0() + (relW * relPx) / REF + r0 + 8, b = relX1() + (openrelW * size.display2xl) / REF + r1 + 8;
  return { x: lerp(a, b, k), y: REL_BASE - r, r };
}
function sceneRel(ctx: Ctx, t: number) {
  if (t < 2.9 || t >= 6.1) return;
  const out = (o: number) => prog(t, 5.75 + o * 0.02, 6.0 + o * 0.02);
  const lk = spring(t - 3.0, SNAPPY);
  ctx.save(); ctx.globalAlpha = clamp(prog(t, 3.0, 3.2)) * (1 - out(0)); ctx.font = fs(mobile.sub, 500); ctx.fillStyle = rgba(color.navy, 0.65);
  ctx.textAlign = "center"; ctx.fillText(COPY.whyLabel, W / 2, 470 + (1 - lk) * 24); ctx.restore();
  for (const g of rel) {
    const i = g.fromIndex!;
    const st = 3.1 + i * 0.022;
    if (t < st) continue;
    const s = spring(t - st, SNAPPY), a0 = prog(t, st, st + 0.12);
    if (g.role === "out") {
      const p = prog(t, 3.85 + g.order * 0.012, 4.1 + g.order * 0.012);
      glyph(ctx, g.char, relX0() + (g.fromX! * relPx) / REF, REL_BASE + (1 - s) * 40 + easeIn(p) * 90, f(relPx), color.navy, a0 * clamp(1 - p * 1.4), easeIn(p) * (g.order % 2 ? 0.4 : -0.35), 1, cw(g.char, relPx, ctx));
    } else {
      const k = t < 4.2 ? 0 : spring(t - 4.2, SNAPPY);
      const px = lerp(relPx, size.display2xl, clamp(k));
      const x = lerp(relX0() + (g.fromX! * relPx) / REF, relX1() + (g.toX! * size.display2xl) / REF, k);
      glyph(ctx, g.char, x, REL_BASE + (1 - s) * 40 + easeIn(out(g.toIndex!)) * 60, f(px), mix(color.navy, color.green, prog(t, 4.3, 4.6)), a0 * (1 - out(g.toIndex!)), 0, 1, cw(g.char, px, ctx));
    }
  }
  if (t >= 4.6) {
    const k = spring(t - 4.6, SNAPPY);
    ctx.save(); ctx.globalAlpha = clamp(prog(t, 4.6, 4.75)) * (1 - out(4)); ctx.font = fs(mobile.sub); ctx.fillStyle = rgba(color.navy, 0.75);
    ctx.textAlign = "center"; ctx.fillText(COPY.relCap, W / 2, REL_BASE + 100 + (1 - k) * 24); ctx.restore();
  }
}

// ── 장면 3: 여섯 단계 루프 ──
const stepAngle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / 6;
const ringPt = (a: number, r = RING.r): Pt => ({ x: RING.x + Math.cos(a) * r, y: RING.y + Math.sin(a) * r });
/** 루프 위 점의 각도 (−π/2에서 시작, 한 바퀴) */
function loopAngle(t: number): number {
  let a = -Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    const st = LOOP_T0 + i * STEP_DT;
    if (t >= st) a += (2 * Math.PI / 6) * easeInOut(prog(t, st, st + STEP_MOVE));
  }
  return a;
}
function sceneLoop(ctx: Ctx, t: number) {
  if (t < 6.0 || t >= 10.6) return;
  const out = 1 - prog(t, 10.25, 10.5);
  const hk = spring(t - 6.05, SNAPPY);
  ctx.save(); ctx.globalAlpha = clamp(prog(t, 6.05, 6.25)) * out; ctx.font = f(size.displayLg); ctx.fillStyle = color.navy;
  ctx.textAlign = "center"; ctx.fillText(COPY.loopHead, W / 2, 300 + (1 - hk) * 40); ctx.restore();
  // 바탕 링 (옅게) + 지나온 호 (진하게)
  const rk = easeOut(prog(t, 6.1, 6.5));
  ctx.save(); ctx.globalAlpha = out;
  ctx.beginPath(); ctx.arc(RING.x, RING.y, RING.r, -Math.PI / 2, -Math.PI / 2 + rk * 2 * Math.PI); ctx.lineWidth = 3; ctx.strokeStyle = rgba(color.navy, 0.18); ctx.stroke();
  const a = loopAngle(t);
  if (a > -Math.PI / 2 + 0.001) { ctx.beginPath(); ctx.arc(RING.x, RING.y, RING.r, -Math.PI / 2, a); ctx.lineWidth = 4; ctx.strokeStyle = rgba(color.navy, 0.85); ctx.stroke(); }
  ctx.restore();
  COPY.steps.forEach((label, i) => {
    const ang = stepAngle(i), p = ringPt(ang);
    const reached = i === 0 ? LOOP_T0 - 0.05 : LOOP_T0 + (i - 1) * STEP_DT + STEP_MOVE - 0.05;
    ctx.save(); ctx.globalAlpha = prog(t, 6.15 + i * 0.05, 6.3 + i * 0.05) * out;
    ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.fillStyle = t >= reached ? color.navy : color.n100; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = color.navy; ctx.stroke(); ctx.restore();
    if (t >= reached) {
      const k = spring(t - reached, SNAPPY), c = Math.cos(ang), s = Math.sin(ang);
      const lp = ringPt(ang, RING.r + 40 + (1 - clamp(k)) * 16);
      ctx.save(); ctx.globalAlpha = clamp(k) * out; ctx.font = f(STEP_SIZE); ctx.fillStyle = color.navy;
      ctx.textAlign = c > 0.3 ? "left" : c < -0.3 ? "right" : "center";
      ctx.fillText(label, lp.x, lp.y + (s > 0.5 ? 34 : s < -0.5 ? 0 : 14)); ctx.restore();
    }
  });
  // 한 바퀴를 돌면 안쪽에 원칙 세 줄
  const doneT = LOOP_T0 + 5 * STEP_DT + STEP_MOVE + 0.05;
  COPY.motto.forEach((m, i) => {
    const st = doneT + i * 0.12;
    if (t < st) return;
    const k = spring(t - st, SNAPPY);
    ctx.save(); ctx.globalAlpha = clamp(prog(t, st, st + 0.15)) * out; ctx.font = fs(32, i === 2 ? 600 : 400); ctx.fillStyle = i === 2 ? color.navy : rgba(color.navy, 0.8);
    ctx.textAlign = "center"; ctx.fillText(m, RING.x, RING.y - 34 + i * 48 + (1 - k) * 20); ctx.restore();
  });
}

// ── 장면 4: 마일스톤 ──
function hopPos(t: number): Pt {
  let prev: Pt = ringPt(-Math.PI / 2), pos = prev;
  HOPS.forEach((hs, i) => {
    const tgt = { x: MS_X[i], y: LINE_Y };
    if (t >= hs) {
      const kx = spring(t - hs, { stiffness: 230, damping: 15 });
      const ky = easeInOut(prog(t, hs, hs + HOP));
      const arc = Math.sin(Math.PI * prog(t, hs, hs + HOP)) * (i === 0 ? 120 : 110);
      pos = { x: lerp(prev.x, tgt.x, kx), y: lerp(prev.y, tgt.y, ky) - arc };
    }
    prev = tgt;
  });
  return pos;
}
function sceneMilestones(ctx: Ctx, t: number) {
  if (t < 10.5 || t >= 13.5) return;
  const out = 1 - prog(t, 12.95, 13.2);
  const hk = spring(t - 10.6, SNAPPY);
  ctx.save(); ctx.globalAlpha = clamp(prog(t, 10.6, 10.8)) * out;
  ctx.font = f(size.display2xl); ctx.fillStyle = color.navy; ctx.fillText(COPY.msHead, 90, 470 + (1 - hk) * 40);
  ctx.font = fs(mobile.sub); ctx.fillStyle = rgba(color.navy, 0.72); ctx.fillText(COPY.msSub, 94, 550 + (1 - hk) * 40);
  ctx.restore();
  const lk = easeOut(prog(t, 10.6, 11.0));
  line(ctx, { x: 120, y: LINE_Y }, { x: lerp(120, 960, lk), y: LINE_Y }, rgba(color.navy, 0.85 * out), 3);
  COPY.milestones.forEach((m, i) => {
    const land = HOPS[i] + HOP;
    ctx.save(); ctx.globalAlpha = prog(t, 10.65 + i * 0.08, 10.75 + i * 0.08) * out;
    ctx.beginPath(); ctx.arc(MS_X[i], LINE_Y, 10, 0, Math.PI * 2); ctx.fillStyle = t >= land ? color.navy : color.n100; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = color.navy; ctx.stroke(); ctx.restore();
    if (t >= land - 0.05) {
      const k = spring(t - land + 0.05, SNAPPY);
      ctx.save(); ctx.globalAlpha = clamp(k) * out; ctx.textAlign = "center";
      ctx.font = fs(mobile.stepNum, 500); ctx.fillStyle = rgba(color.navy, 0.55); ctx.fillText(`0${i + 1}`, MS_X[i], LINE_Y + 74 + (1 - k) * 24);
      ctx.font = f(STEP_SIZE); ctx.fillStyle = color.navy; ctx.fillText(m, MS_X[i], LINE_Y + 132 + (1 - k) * 24);
      ctx.restore();
    }
  });
  if (t >= 11.0) {
    const k = spring(t - 11.0, SNAPPY);
    ctx.save(); ctx.globalAlpha = clamp(prog(t, 11.0, 11.2)) * out; ctx.font = fs(mobile.sub); ctx.fillStyle = rgba(color.navy, 0.75);
    ctx.fillText(COPY.msFoot, 94, LINE_Y + 260 + (1 - k) * 24); ctx.restore();
  }
}

// ── 장면 5: 평가 기준 궤도 → LOOP → POOL ──
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const loopOrigin = () => (W - (loopW * size.display2xl) / REF) / 2;
const poolOrigin = () => (W - (poolW * size.display2xl) / REF) / 2;
function orbitGlyph(c: { s: number; word: number }, t: number) {
  const ent = spring(t - T.orbit - 0.05 - c.word * 0.05, SNAPPY);
  let r = ORBIT_R * ent;
  if (c.word !== 4 && t >= T.straight) r += easeIn(prog(t, T.straight, T.straight + 0.45)) * 700;
  const PHI0 = -Math.PI / 2 - OMEGA * 1.0 - loopCenterS / ORBIT_R;
  const base = PHI0 + OMEGA * (Math.min(t, T.straight) - (T.straight - 1.0)) + OMEGA * 0.35 * easeOut(prog(t, T.straight, T.straight + 0.4));
  const th = base + c.s / ORBIT_R;
  return { x: ORBIT.x + Math.cos(th) * r, y: ORBIT.y + Math.sin(th) * r, rot: th + Math.PI / 2 };
}
function sceneOrbit(ctx: Ctx, t: number, dot: Pt) {
  if (t < T.orbit || t >= T.logo + 0.3) return;
  dotGrid(ctx, 0.1 * prog(t, T.straight + 0.1, T.straight + 0.6), color.n100, dot, 3.2);
  const px = size.display2xl;
  let li = 0;
  for (const c of orbitChars) {
    const o = orbitGlyph(c, t);
    const w = cw(c.ch, ORBIT_SIZE, ctx);
    if (c.word !== 4) {
      const a = prog(t, T.orbit + 0.05, T.orbit + 0.3) * (1 - prog(t, T.straight + 0.05, T.straight + 0.4));
      glyph(ctx, c.ch, o.x - w / 2, o.y, f(ORBIT_SIZE), color.n100, a, o.rot, 1, w);
      continue;
    }
    const idx = li++;
    const s = t < T.straight ? 0 : spring(t - T.straight - idx * 0.015, SOFT);
    const gpx = lerp(ORBIT_SIZE, px, s), gw = cw(c.ch, gpx, ctx);
    let x = lerp(o.x - w / 2, loopOrigin() + (loopLine[idx] * px) / REF, s), y = lerp(o.y, KN_BASE, s);
    const rot = lerp(wrap(o.rot), 0, s);
    let a = prog(t, T.orbit + 0.05, T.orbit + 0.3);
    const g = pool.find((m) => m.fromIndex === idx)!;
    const k2 = t < T.keep ? 0 : spring(t - T.keep, SNAPPY);
    x = lerp(x, poolOrigin() + (g.toX! * px) / REF, k2);
    // L은 위로, P는 아래로 크게 돌아 O·O를 사이에 두고 자리를 맞바꿈
    y += Math.sin(Math.PI * clamp(k2)) * (g.fromIndex === 0 ? -110 : g.fromIndex === 3 ? 110 : 0);
    const fill = mix(color.n100, color.green, prog(t, T.keep, T.keep + 0.3));
    if (t >= T.logo - 0.1) { const p = prog(t, T.logo - 0.1 + idx * 0.03, T.logo + 0.15 + idx * 0.03); y -= easeIn(p) * 80; a *= 1 - p; }
    glyph(ctx, c.ch, x, y, f(gpx), fill, a, rot, 1, gw);
  }
  if (t >= T.under[0]) {
    const k = spring(t - T.under[0], SNAPPY);
    ctx.save(); ctx.globalAlpha = clamp(prog(t, T.under[0], T.under[0] + 0.15)) * (1 - prog(t, T.logo - 0.1, T.logo + 0.1));
    ctx.font = fs(mobile.sub); ctx.fillStyle = color.n50; ctx.textAlign = "center";
    ctx.fillText(COPY.poolCap, W / 2, UNDER_Y + 90 + (1 - k) * 24); ctx.restore();
  }
}
function edgeSegment(t: number): [Pt, Pt] | null {
  if (t < T.under[0] || t >= T.endOut + 0.25) return null;
  const x0 = poolOrigin() - 6;
  const a0 = { x: x0, y: UNDER_Y }, b0 = { x: lerp(x0, W - x0 + 6, easeInOut(prog(t, T.under[0], T.under[1]))), y: UNDER_Y };
  const da = logoPt(LOGO_DIAG.a, LOGO, LOGO_S), db = logoPt(LOGO_DIAG.b, LOGO, LOGO_S);
  const k = t < T.logo ? 0 : spring(t - T.logo, SOFT);
  let a = { x: lerp(a0.x, da.x, k), y: lerp(a0.y, da.y, k) }, b = { x: lerp(b0.x, db.x, k), y: lerp(b0.y, db.y, k) };
  if (t >= T.endOut) { const p = easeIn(prog(t, T.endOut, T.endOut + 0.25)); a = { x: lerp(a.x, LOGO.x, p), y: lerp(a.y, LOGO.y, p) }; b = { x: lerp(b.x, LOGO.x, p), y: lerp(b.y, LOGO.y, p) }; }
  return [a, b];
}

// ── 장면 6: 엔드카드 ──
function sceneEnd(ctx: Ctx, t: number) {
  if (t < T.logo || t >= T.endOut + 0.3) return;
  const outP = (o: number) => prog(t, T.endOut + o * 0.006, T.endOut + 0.22 + o * 0.006);
  const star = t < T.logo + 0.25 ? 0 : Math.max(0, spring(t - T.logo - 0.25, BOUNCY)) * (1 - easeIn(prog(t, T.endOut, T.endOut + 0.22)));
  drawLogo(ctx, LOGO, LOGO_S * star, color.n100);
  const px = 120;
  const row = (txt: string, x: number, y: number, st: number, o: number, fnt: (p: number) => string, fill: string) => {
    ctx.font = fnt(px);
    const xs = glyphXs(ctx, txt);
    [...txt].forEach((ch, i) => {
      const s = st + i * 0.02, k = spring(t - s, SNAPPY), p = outP(o + i);
      glyph(ctx, ch, x + xs[i], y + (1 - k) * 60 + easeIn(p) * 60, fnt(px), fill, prog(t, s, s + 0.15) * (1 - p), 0, 1, 0);
    });
  };
  ctx.font = f(px); const wa = ctx.measureText(COPY.title).width;
  ctx.font = fi(px); const wb = ctx.measureText(COPY.titleItalic).width;
  const x0 = (W - wa - wb - 8) / 2;
  row(COPY.title, x0, 870, T.logo + 0.45, 0, f, color.n100);
  row(COPY.titleItalic, x0 + wa + 8, 870, T.logo + 0.55, 6, fi, color.green);
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

// ── 녹색 점: 하나의 오브젝트 (토글 손잡이 → 마침표 → 루프 → 마일스톤 → 궤도 중심 → 로고 → 다시 손잡이) ──
function dotState(t: number): Pt & { r: number } {
  if (t < 1.0) return KNOB;
  if (t < 2.9) {
    const P = globalPeriod(), k = prog(t, 1.0, 1.6);
    return { x: lerp(KNOB.x, P.x, easeInOut(k)), y: lerp(KNOB.y, P.y, easeInOut(k)) - Math.sin(Math.PI * k) * 220, r: lerp(KNOB.r, P.r, easeOut(k)) };
  }
  if (t < 6.0) {
    const A = globalPeriod(), B = relPeriod(t), k = prog(t, 2.9, 3.3);
    return { x: lerp(A.x, B.x, easeInOut(k)), y: lerp(A.y, B.y, easeInOut(k)) - Math.sin(Math.PI * k) * 120, r: lerp(A.r, B.r, k) };
  }
  if (t < 10.7) {
    const A = relPeriod(6.0), top = ringPt(-Math.PI / 2), k = prog(t, 6.0, 6.5);
    if (t < 6.5) return { x: lerp(A.x, top.x, easeInOut(k)), y: lerp(A.y, top.y, easeInOut(k)) - Math.sin(Math.PI * k) * 140, r: lerp(A.r, 16, k) };
    const p = ringPt(loopAngle(t));
    return { ...p, r: 16 };
  }
  if (t < T.orbit) {
    const p = hopPos(t);
    let r = 16;
    if (t >= 13.0) r = lerp(16, 1300, easeIn(prog(t, 13.0, 13.48)));
    return { ...p, r };
  }
  if (t < T.straight) {
    const k = easeInOut(prog(t, T.orbit, T.orbit + 0.4));
    return { x: lerp(MS_X[3], ORBIT.x, k), y: lerp(LINE_Y, ORBIT.y, k), r: lerp(1300, 18, k) };
  }
  const u0 = { x: poolOrigin() - 6, y: UNDER_Y };
  if (t < T.under[0]) {
    const k = prog(t, T.keep + 0.1, T.under[0] - 0.02);
    return { x: lerp(ORBIT.x, u0.x, easeInOut(k)), y: lerp(ORBIT.y, u0.y, easeInOut(k)) - Math.sin(Math.PI * k) * 240, r: 18 };
  }
  const uEnd = W - u0.x;
  if (t < T.logo) return { x: lerp(u0.x, uEnd, easeInOut(prog(t, T.under[0], T.under[1]))), y: UNDER_Y, r: 18 };
  if (t < T.back[0]) {
    const k = spring(t - T.logo, SOFT);
    return { x: lerp(uEnd, LOGO.x, k), y: lerp(UNDER_Y, LOGO.y, k), r: lerp(18, 16, clamp(k)) };
  }
  const k = prog(t, T.back[0], T.back[1]);
  return { x: lerp(LOGO.x, KNOB.x, easeInOut(k)), y: lerp(LOGO.y, KNOB.y, easeInOut(k)) - Math.sin(Math.PI * k) * 160, r: lerp(16, KNOB.r, easeOut(k)) };
}

export function render(ctx: Ctx, tIn: number): void {
  const t = ((tIn % SOURCE) + SOURCE) % SOURCE;
  const dark = t >= 13.48 && t < T.light[1];
  ctx.fillStyle = dark ? color.navy : color.n100; ctx.fillRect(0, 0, 1080, 1350);
  ctx.drawImage(dark ? grain.dark : grain.light, 0, 0, 1080, 1350);
  const dot = dotState(t);
  if (!dark) {
    wordmark(ctx, t < 12.95 ? 1 : t >= T.light[1] ? easeOut(prog(t, T.light[1], T.back[1])) : 0);
    if (t < 2.95 || t >= T.back[0]) sceneHook(ctx, t);
    sceneRel(ctx, t);
    sceneLoop(ctx, t);
    sceneMilestones(ctx, t);
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
  circle(ctx, dot.x, dot.y, dot.r, color.green);
}
