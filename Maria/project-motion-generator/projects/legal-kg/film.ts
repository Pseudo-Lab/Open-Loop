// 프로젝트: 법률 지식 그래프 구축해보기 (장면 코드)
import { color, size, mobile, W, H } from "../../engine/tokens";

/** 본편 장면의 원본 길이 (영상 길이는 timeline.ts가 결정) */
const DURATION = 13.5;
import { spring, SNAPPY, BOUNCY, SOFT, clamp, lerp, prog, easeInOut, easeIn, easeOut } from "../../engine/spring";
import { buildMorph, glyphXs, type Glyph } from "../../engine/morph";
import { LOGO_DIAG, LOGO_STROKE } from "../../engine/logo";
import {
  type Ctx, type Pt, REF, f, fs, fi, mix, rgba, grain, glyph, rrect, circle, line, cw,
  dotGrid, cursor, wordmark, drawLogo, logoPt,
} from "../../engine/draw";


// ───────────────────────── 레이아웃 상수 ─────────────────────────
const ROW = { x: 90, y: 560, w: 900, h: 170 };
const LABEL = { x: ROW.x + 56, base: ROW.y + ROW.h / 2 + 15, size: size.headline1 };
const TOG = { w: 120, h: 68, cx: ROW.x + ROW.w - 56 - 60, cy: ROW.y + ROW.h / 2 };
const BIG = { size: size.display2xl, base: 720 };
const CURSOR_REST: Pt = { x: 800, y: 1010 };

const CENTER: Pt = { x: 540, y: 600 };
const SAT = [
  { label: "Act", x: 270, y: 380, side: -1 },
  { label: "Article", x: 790, y: 400, side: 1 },
  { label: "Case", x: 820, y: 830, side: 1 },
  { label: "Term", x: 260, y: 810, side: -1 },
  { label: "", x: 590, y: 250, side: 1 },
  { label: "", x: 470, y: 950, side: 1 },
];
const CROSS: Array<{ a: number; b: number; label: string; t: number }> = [
  { a: 0, b: 1, label: "contains", t: 3.55 },
  { a: 2, b: 1, label: "cites", t: 3.8 },
  { a: 3, b: 0, label: "defines", t: 4.05 },
  { a: 3, b: 2, label: "", t: 4.2 },
  { a: 4, b: 1, label: "", t: 4.15 },
  { a: 5, b: 3, label: "", t: 4.25 },
];
const LEGAL = { size: size.display2xl, base: 1130 };

const LINE_Y = 780;
const STOPS = [
  { x: 200, label: "Collect", n: "01" },
  { x: 540, label: "Build", n: "02" },
  { x: 860, label: "Open source", n: "03" },
];
const HOPS = [5.8, 6.45, 7.0]; // 출발 시각
const HOP_DUR = 0.36;

const ORBIT: Pt = { x: 540, y: 640 };
const ORBIT_R = 340;
const WORDS = ["LAW", "ONTOLOGY", "GRAPH DB", "OPEN SOURCE", "KNOWLEDGE"];
const ORBIT_SIZE = mobile.orbit;
const OMEGA = 0.5;
const KN_BASE = 700;
const UNDER_Y = 738;

const LOGO: Pt = { x: 540, y: 380 };   // 화면상 별 중심
const LOGO_S = 3.6;                       // 엔드카드 로고 배율 (86 → 약 310px)
// ───────────────────────── 측정 (폰트 로드 후 1회) ─────────────────────────
interface Measured {
  hideMorph: Glyph[];
  connW: number; labelW: number; dotlessW: number; ascI: number;
  legal: Glyph[]; legalFromW: number; legalToW: number;
  orbitChars: Array<{ ch: string; word: number; s: number }>;
  orbitWordW: number[];
  knLine: number[]; knW: number; edgeMorph: Glyph[]; edgeW: number;
  title1W: number; knowW: number; graphW: number;
  satLabelW: number[];
}
let M: Measured;
let M_orbitCenterK = 0;

export function measure(ctx: Ctx): void {
  ctx.font = f(REF);
  const hideMorph = buildMorph(ctx, "Hide Connections", "Connectıons", 5);
  // keepFrom 방식: 원본도 점 없는 ı로
  const hide2 = buildMorph(ctx, "Hide Connectıons", "Connectıons", 5);
  const connW = ctx.measureText("Connectıons").width;
  const labelW = ctx.measureText("Hide Connectıons").width;
  const dotlessW = ctx.measureText("ı").width;
  const ascI = ctx.measureText("i").actualBoundingBoxAscent;
  void hideMorph;

  const legal = buildMorph(ctx, "Legalese", "Legal ease");
  const legalFromW = ctx.measureText("Legalese").width;
  const legalToW = ctx.measureText("Legal ease").width;

  // 궤도 글자 배치 (ORBIT_SIZE 기준 실제 px)
  ctx.font = f(ORBIT_SIZE);
  const circ = 2 * Math.PI * ORBIT_R;
  const widths = WORDS.map((w) => ctx.measureText(w).width);
  const gap = (circ - widths.reduce((a, b) => a + b, 0)) / WORDS.length;
  const orbitChars: Measured["orbitChars"] = [];
  const orbitWordW: number[] = [];
  let cursorS = 0;
  WORDS.forEach((w, wi) => {
    const xs = glyphXs(ctx, w);
    const ww = widths[wi];
    orbitWordW.push(ww);
    const centerS = cursorS + ww / 2;
    [...w].forEach((ch, i) => {
      const cw_ = ctx.measureText(ch).width;
      orbitChars.push({ ch, word: wi, s: centerS + (xs[i] + cw_ / 2) - ww / 2 });
    });
    cursorS += ww + gap;
  });
  M_orbitCenterK = cursorS - gap - widths[4] / 2; // KNOWLEDGE 중심 호 위치
  ctx.font = f(REF);
  const knLine = glyphXs(ctx, "KNOWLEDGE");
  const knW = ctx.measureText("KNOWLEDGE").width;
  const edgeMorph = buildMorph(ctx, "KNOWLEDGE", "EDGE", 5);
  const edgeW = ctx.measureText("EDGE").width;

  const title1W = ctx.measureText("Building a Legal").width;
  const knowW = ctx.measureText("Knowledge ").width;
  ctx.font = fi(REF);
  const graphW = ctx.measureText("Graph").width;

  ctx.font = fs(mobile.nodeLabel, 500);
  const satLabelW = SAT.map((s) => ctx.measureText(s.label).width);

  M = { hideMorph: hide2, connW, labelW, dotlessW, ascI, legal, legalFromW, legalToW, orbitChars, orbitWordW,
    knLine, knW, edgeMorph, edgeW, title1W, knowW, graphW, satLabelW };
}



// ───────────────────────── 장면 1: Hide Connections ─────────────────────────
function rowOrigin(): number { return LABEL.x; }
function bigOrigin(): number { return (W - M.connW * BIG.size / REF) / 2; }

/** "Connections" 글자들의 현재 크기·위치 (k: 0=행 레이아웃, 1=크게 가운데) */
function connGlyphState(g: Glyph, k: number) {
  const px = lerp(LABEL.size, BIG.size, k);
  const x0 = rowOrigin() + (g.fromX! * LABEL.size) / REF;
  const x1 = bigOrigin() + (g.toX! * BIG.size) / REF;
  const y = lerp(LABEL.base, BIG.base, k);
  return { px, x: lerp(x0, x1, k), y };
}
function connK(t: number): number {
  if (t < 1.3) return 0;
  if (t < 12.9) return spring(t - 1.3, SNAPPY);
  // 복귀: 13.05~13.35 사이 이징으로 0에 정확히 도달
  return 0;
}
function tittle(t: number): Pt & { r: number } {
  const g = M.hideMorph.find((x) => x.role === "keep" && x.char === "ı")!;
  const k = connK(t);
  const s = connGlyphState(g, k);
  const w = (M.dotlessW * s.px) / REF;
  const r = s.px * 0.1;
  return { x: s.x + w / 2, y: s.y - (M.ascI * s.px) / REF + r * 0.9, r };
}

function sceneOpen(ctx: Ctx, t: number) {
  // 카드 + 토글
  let cardA = 1 - prog(t, 1.25, 1.6);
  if (t >= 12.9) cardA = easeOut(prog(t, 13.05, 13.35));
  // 토글 노브: 1.0초 클릭에 OFF, 복귀 시 ON
  let knob = 0; // 0 = ON(오른쪽), 1 = OFF(왼쪽)
  if (t >= 1.0 && t < 12.9) knob = spring(t - 1.0, SNAPPY);
  if (t >= 12.9) knob = 1 - easeOut(prog(t, 13.1, 13.4));
  if (cardA > 0.001) {
    ctx.save();
    ctx.globalAlpha = cardA;
    rrect(ctx, ROW.x, ROW.y, ROW.w, ROW.h, 30);
    ctx.fillStyle = color.n50; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(color.navy, 0.1); ctx.stroke();
    const tx = TOG.cx - TOG.w / 2, ty = TOG.cy - TOG.h / 2;
    rrect(ctx, tx, ty, TOG.w, TOG.h, TOG.h / 2);
    ctx.fillStyle = mix(color.green, "#C9CCC6", knob); ctx.fill();
    const kr = TOG.h / 2 - 7;
    const kx = lerp(tx + TOG.w - TOG.h / 2, tx + TOG.h / 2, knob);
    circle(ctx, kx, TOG.cy, kr, color.n50);
    ctx.restore();
  }

  // "Hide " 글자: 클릭 후 떨어짐, 복귀 때 다시 올라옴
  for (const g of M.hideMorph.filter((x) => x.role === "out")) {
    const px = LABEL.size;
    const x = rowOrigin() + (g.fromX! * px) / REF;
    let dy = 0, rot = 0, a = 1;
    if (t >= 1.05 && t < 12.9) {
      const p = prog(t, 1.05 + g.order * 0.05, 1.5 + g.order * 0.05);
      dy = easeIn(p) * 110; rot = easeIn(p) * (g.order % 2 ? 0.55 : -0.45); a = 1 - p;
    } else if (t >= 12.9) {
      const p = easeOut(prog(t, 13.1 + g.order * 0.03, 13.4));
      dy = (1 - p) * 40; a = p;
    }
    glyph(ctx, g.char, x, LABEL.base + dy, f(px), color.navy, a, rot, 1, cw(g.char, px, ctx));
  }

  // "Connections" (점 없는 ı)
  const k = connK(t);
  for (const g of M.hideMorph.filter((x) => x.role === "keep")) {
    let kk = k;
    if (t >= 1.3 && t < 12.9) kk = spring(t - 1.3 - g.order * 0.012, SNAPPY);
    const s = connGlyphState(g, kk);
    let a = 1, dy = 0;
    if (t >= 2.5 && t < 12.9) { // 장면 2로 넘어가며 퇴장
      const p = prog(t, 2.5 + g.order * 0.02, 2.82 + g.order * 0.02);
      a = 1 - p; dy = easeIn(p) * 50;
    } else if (t >= 12.9) {
      const p = easeOut(prog(t, 13.05 + g.order * 0.015, 13.35));
      a = p; dy = (1 - p) * 30;
    }
    glyph(ctx, g.char, s.x, s.y + dy, f(s.px), color.navy, a, 0, 1, cw(g.char, s.px, ctx));
  }

  // 커서
  let cp: Pt = CURSOR_REST, cs = 1, ca = 1;
  const target = { x: TOG.cx + 14, y: TOG.cy + 6 };
  if (t < 12.9) {
    const m = easeInOut(prog(t, 0.25, 0.88));
    cp = { x: lerp(CURSOR_REST.x, target.x, m), y: lerp(CURSOR_REST.y, target.y, m) };
    if (t >= 0.9 && t < 1.15) cs = t < 1.0 ? lerp(1, 0.86, prog(t, 0.9, 1.0)) : lerp(0.86, 1, prog(t, 1.0, 1.15));
    if (t >= 1.2) {
      const p = easeInOut(prog(t, 1.2, 1.7));
      cp = { x: lerp(target.x, CURSOR_REST.x + 60, p), y: lerp(target.y, CURSOR_REST.y + 140, p) };
      ca = 1 - prog(t, 1.35, 1.7);
    }
  } else {
    const p = easeOut(prog(t, 13.1, 13.4));
    cp = { x: lerp(CURSOR_REST.x + 60, CURSOR_REST.x, p), y: lerp(CURSOR_REST.y + 140, CURSOR_REST.y, p) };
    ca = p;
  }
  if (t < 1.7 || t >= 12.9) cursor(ctx, cp, cs, ca);
}

// ───────────────────────── 장면 2: 그래프 + Legalese ─────────────────────────
function satPos(i: number, t: number): Pt {
  const s = SAT[i];
  const ts = 3.0 + i * 0.09;
  let k = spring(t - ts, SNAPPY);
  if (t >= 5.5) k = 1 - easeIn(prog(t, 5.5, 5.85));
  return { x: lerp(CENTER.x, s.x, k), y: lerp(CENTER.y, s.y, k) };
}

function sceneGraph(ctx: Ctx, t: number, dot: Pt) {
  // 도트 그리드
  const gA = 0.16 * prog(t, 2.7, 3.2) * (1 - prog(t, 5.5, 5.9));
  dotGrid(ctx, gA, color.navy, dot, 3.4);

  if (t >= 2.95 && t < 5.9) {
    // 중심 엣지
    SAT.forEach((_, i) => {
      if (t < 3.0 + i * 0.09) return;
      line(ctx, CENTER, satPos(i, t), rgba(color.navy, 0.5), 2.5);
    });
    // 교차 엣지 (길이는 스프링, 끝점 넘침은 잘라냄)
    for (const e of CROSS) {
      if (t < e.t) continue;
      let k = Math.min(1, spring(t - e.t, SNAPPY));
      const a = satPos(e.a, t), b = satPos(e.b, t);
      const tip = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
      line(ctx, a, tip, rgba(color.navy, 0.5), 2.5);
      if (e.label && t < 5.65) {
        const la = prog(t, e.t + 0.2, e.t + 0.4) * (1 - prog(t, 5.5, 5.65));
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        ctx.save(); ctx.globalAlpha = la;
        ctx.font = fs(mobile.edgeLabel, 500);
        const w = ctx.measureText(e.label).width;
        rrect(ctx, mid.x - w / 2 - 16, mid.y - 27, w + 32, 50, 25);
        ctx.fillStyle = color.n100; ctx.fill();
        ctx.fillStyle = rgba(color.navy, 0.8); ctx.textAlign = "center";
        ctx.fillText(e.label, mid.x, mid.y + 10);
        ctx.restore();
      }
    }
    // 위성 노드 + 라벨
    SAT.forEach((s, i) => {
      const ts = 3.0 + i * 0.09;
      if (t < ts) return;
      const p = satPos(i, t);
      circle(ctx, p.x, p.y, s.label ? 12 : 8, color.navy);
      if (s.label) {
        const la = prog(t, ts + 0.15, ts + 0.4) * (1 - prog(t, 5.5, 5.65));
        ctx.save(); ctx.globalAlpha = la;
        ctx.font = fs(mobile.nodeLabel, 500); ctx.fillStyle = color.navy;
        ctx.textAlign = s.side < 0 ? "right" : "left";
        ctx.fillText(s.label, p.x + s.side * 28, p.y + 13);
        ctx.restore();
      }
    });
  }

  // Legalese → Legal ease
  if (t >= 3.2 && t < 5.95) {
    const px = LEGAL.size;
    const x0 = (W - (M.legalFromW * px) / REF) / 2;
    const x1 = (W - (M.legalToW * px) / REF) / 2;
    for (const g of M.legal) {
      const w = cw(g.char, px, ctx);
      let x: number, a = 1, dy = 0, sc = 1, fill: string = color.navy;
      if (g.role === "keep") {
        const k = t < 4.5 ? 0 : spring(t - 4.5 - g.order * 0.012, SNAPPY);
        x = lerp(x0 + (g.fromX! * px) / REF, x1 + (g.toX! * px) / REF, k);
        const idx = g.fromIndex!;
        const pin = spring(t - 3.25 - idx * 0.035, SNAPPY);
        dy = (1 - pin) * 50; a = prog(t, 3.25 + idx * 0.035, 3.45 + idx * 0.035);
      } else if (g.role === "in") {
        if (g.char === " " || t < 4.62) continue;
        x = x1 + (g.toX! * px) / REF;
        sc = spring(t - 4.62, BOUNCY); fill = color.green;
      } else continue;
      if (t >= 5.5) {
        const o = g.role === "keep" ? g.toIndex! : 7;
        const p = prog(t, 5.5 + o * 0.025, 5.8 + o * 0.025);
        a *= 1 - p; dy += easeIn(p) * 70;
      }
      glyph(ctx, g.char, x, LEGAL.base + dy, f(px), fill, a, 0, Math.max(0, sc), w);
    }
  }
}

// ───────────────────────── 장면 3: 로드맵 ─────────────────────────
function hopPos(t: number): Pt {
  let prev: Pt = SERIES_FIRST;
  let pos: Pt = SERIES_FIRST;
  HOPS.forEach((hs, i) => {
    const tgt = { x: STOPS[i].x, y: LINE_Y };
    if (t >= hs) {
      const kx = spring(t - hs, { stiffness: 230, damping: 15 });
      const ky = easeInOut(prog(t, hs, hs + HOP_DUR));
      const arc = Math.sin(Math.PI * prog(t, hs, hs + HOP_DUR)) * (i === 0 ? 90 : 130);
      pos = { x: lerp(prev.x, tgt.x, kx), y: lerp(prev.y, tgt.y, ky) - arc };
    }
    prev = tgt;
  });
  return pos;
}

function sceneRoadmap(ctx: Ctx, t: number) {
  if (t < 5.7 || t >= 8.0) return;
  const out = 1 - prog(t, 7.55, 7.8);
  // 제목
  ctx.save();
  const hA = prog(t, 5.9, 6.2) * out;
  const hy = (1 - spring(t - 5.9, SNAPPY)) * 40;
  ctx.globalAlpha = hA;
  ctx.font = f(size.display2xl); ctx.fillStyle = color.navy;
  ctx.fillText("12 weeks", 90, 470 + hy);
  ctx.font = fs(mobile.sub); ctx.fillStyle = rgba(color.navy, 0.72);
  ctx.fillText("Every Wednesday, October to December 2026", 94, 550 + hy);
  ctx.restore();

  // 라인
  const lk = easeOut(prog(t, 5.75, 6.2));
  line(ctx, { x: 150, y: LINE_Y }, { x: lerp(150, 930, lk), y: LINE_Y }, rgba(color.navy, 0.85 * out), 3);
  // 결과물: 03에 착지하면 등장
  {
    const st = 6.15; // 라인이 다 그려진 직후 등장 → 로드맵 내내 읽을 수 있게
    if (t >= st) {
      const k = spring(t - st, SNAPPY);
      ctx.save(); ctx.globalAlpha = clamp(k) * out;
      ctx.font = fs(mobile.sub); ctx.fillStyle = rgba(color.navy, 0.72);
      ctx.fillText("Open dataset and code, published on GitHub", 94, LINE_Y + 250 + (1 - k) * 24);
      ctx.restore();
    }
  }
  STOPS.forEach((s, i) => {
    const land = HOPS[i] + HOP_DUR;
    const shown = prog(t, 5.75 + (s.x - 150) / 780 * 0.45, 5.8 + (s.x - 150) / 780 * 0.45);
    ctx.save();
    ctx.globalAlpha = shown * out;
    ctx.beginPath(); ctx.arc(s.x, LINE_Y, 10, 0, Math.PI * 2);
    ctx.fillStyle = t >= land ? color.navy : color.n100; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = color.navy; ctx.stroke();
    ctx.restore();
    if (t >= land - 0.05) {
      const k = spring(t - land + 0.05, SNAPPY);
      ctx.save(); ctx.globalAlpha = clamp(k) * out; ctx.textAlign = "center";
      ctx.font = fs(mobile.stepNum, 500); ctx.fillStyle = rgba(color.navy, 0.6);
      ctx.fillText(s.n, s.x, LINE_Y + 74 + (1 - k) * 24);
      ctx.font = f(mobile.step); ctx.fillStyle = color.navy;
      ctx.fillText(s.label, s.x, LINE_Y + 138 + (1 - k) * 24);
      ctx.restore();
    }
  });
}

// ───────────────────────── 장면 4: 궤도 + KNOWLEDGE → EDGE ─────────────────────────
function orbitGlyph(c: Measured["orbitChars"][number], t: number) {
  const ent = spring(t - 8.35 - c.word * 0.05, SNAPPY);
  let r = ORBIT_R * ent;
  if (c.word !== 4 && t >= 9.3) r += easeIn(prog(t, 9.3, 9.75)) * 700;
  const PHI0 = -Math.PI / 2 - OMEGA * 1.0 - M_orbitCenterK / ORBIT_R;
  const base = PHI0 + OMEGA * (Math.min(t, 9.3) - 8.3) + OMEGA * 0.35 * easeOut(prog(t, 9.3, 9.7));
  const th = base + c.s / ORBIT_R;
  return { x: ORBIT.x + Math.cos(th) * r, y: ORBIT.y + Math.sin(th) * r, rot: th + Math.PI / 2 };
}
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

function knOrigin(): number { return (W - (M.knW * size.display2xl) / REF) / 2; }
function edgeOrigin(): number { return (W - (M.edgeW * size.display2xl) / REF) / 2; }

function sceneKeywords(ctx: Ctx, t: number, dot: Pt) {
  if (t < 8.3 || t >= 10.75) return;
  dotGrid(ctx, 0.1 * prog(t, 9.4, 9.9), color.n100, dot, 3.2);
  const px = size.display2xl;
  let ki = 0;
  for (const c of M.orbitChars) {
    const o = orbitGlyph(c, t);
    const w = cw(c.ch, ORBIT_SIZE, ctx);
    if (c.word !== 4) {
      const a = prog(t, 8.35, 8.6) * (1 - prog(t, 9.35, 9.7));
      // 회전 피벗을 글자 중심으로 맞추기 위해 x를 반폭만큼 보정
      glyph(ctx, c.ch, o.x - w / 2, o.y, f(ORBIT_SIZE), color.n100, a, o.rot, 1, w);
      continue;
    }
    // KNOWLEDGE: 궤도 → 직선 → KNOWL 퇴장 / EDGE 가운데로
    const idx = ki++;
    const s = t < 9.3 ? 0 : spring(t - 9.3 - idx * 0.015, SOFT);
    const lineX = knOrigin() + (M.knLine[idx] * px) / REF;
    const gpx = lerp(ORBIT_SIZE, px, s);
    const gw = cw(c.ch, gpx, ctx);
    let x = lerp(o.x - w / 2, lineX, s), y = lerp(o.y, KN_BASE, s), rot = lerp(wrap(o.rot), 0, s);
    let a = prog(t, 8.35, 8.6), fill: string = color.n100;
    const g = M.edgeMorph.find((m) => m.fromIndex === idx)!;
    if (g.role === "out" && t >= 9.75) {
      const p = prog(t, 9.75 + g.order * 0.03, 9.97 + g.order * 0.03);
      y -= easeIn(p) * 70; x -= easeIn(p) * 60; rot += easeIn(p) * (g.order % 2 ? 0.5 : -0.4); a *= 1 - p;
    }
    if (g.role === "keep") {
      const k2 = t < 9.95 ? 0 : spring(t - 9.95 - g.order * 0.015, SNAPPY);
      x = lerp(x, edgeOrigin() + (g.toX! * px) / REF, k2);
      fill = mix(color.n100, color.green, prog(t, 9.95, 10.2));
      if (t >= 10.35) {
        const p = prog(t, 10.35 + g.order * 0.03, 10.6 + g.order * 0.03);
        y -= easeIn(p) * 80; a *= 1 - p;
      }
    }
    glyph(ctx, c.ch, x, y, f(gpx), fill, a, rot, 1, gw);
  }
}

// 밑줄 엣지 → 로고 대각선
function edgeSegment(t: number): [Pt, Pt] | null {
  if (t < 10.1 || t >= 12.75) {
    if (t >= 12.5 && t < 12.75) {/* handled below */} else return null;
  }
  const x0 = edgeOrigin() - 6;
  const a0: Pt = { x: x0, y: UNDER_Y };
  const b0: Pt = { x: lerp(x0, 990, easeInOut(prog(t, 10.1, 10.4))), y: UNDER_Y };
  const da = logoPt(LOGO_DIAG.a, LOGO, LOGO_S);
  const db = logoPt(LOGO_DIAG.b, LOGO, LOGO_S);
  let k = t < 10.45 ? 0 : spring(t - 10.45, SOFT);
  let a = { x: lerp(a0.x, da.x, k), y: lerp(a0.y, da.y, k) };
  let b = { x: lerp(b0.x, db.x, k), y: lerp(b0.y, db.y, k) };
  if (t >= 12.5) { // 로고 붕괴: 중심으로 수축
    const p = easeIn(prog(t, 12.5, 12.75));
    a = { x: lerp(a.x, LOGO.x, p), y: lerp(a.y, LOGO.y, p) };
    b = { x: lerp(b.x, LOGO.x, p), y: lerp(b.y, LOGO.y, p) };
  }
  return [a, b];
}

// ───────────────────────── 장면 5: 엔드카드 ─────────────────────────
function sceneEnd(ctx: Ctx, t: number) {
  if (t < 10.45 || t >= 12.8) return;
  const outP = (o: number) => prog(t, 12.5 + o * 0.006, 12.72 + o * 0.006);
  // 대각선(엣지)이 자리 잡은 뒤, 별 중심에서 로고 전체가 스프링으로 펼쳐짐
  const star = t < 10.7 ? 0 : Math.max(0, spring(t - 10.7, BOUNCY)) * (1 - easeIn(prog(t, 12.5, 12.72)));
  drawLogo(ctx, LOGO, LOGO_S * star, color.n100);

  const px = size.display2xl;
  // 1행
  ctx.font = f(px);
  const t1 = "Building a Legal";
  const x1 = (W - (M.title1W * px) / REF) / 2;
  const xs1 = glyphXs(ctx, t1);
  [...t1].forEach((ch, i) => {
    const st = 10.9 + i * 0.016;
    const k = spring(t - st, SNAPPY);
    const p = outP(i);
    glyph(ctx, ch, x1 + xs1[i], 790 + (1 - k) * 60 + easeIn(p) * 60, f(px), color.n100, prog(t, st, st + 0.15) * (1 - p), 0, 1, 0);
  });
  // 2행: Knowledge (Hepta Slab) + Graph (이탤릭, 그린)
  const w2 = ((M.knowW + M.graphW) * px) / REF;
  const x2 = (W - w2) / 2;
  const t2 = "Knowledge ";
  const xs2 = glyphXs(ctx, t2);
  [...t2].forEach((ch, i) => {
    const st = 11.0 + i * 0.016;
    const k = spring(t - st, SNAPPY);
    const p = outP(i + 16);
    glyph(ctx, ch, x2 + xs2[i], 890 + (1 - k) * 60 + easeIn(p) * 60, f(px), color.n100, prog(t, st, st + 0.15) * (1 - p), 0, 1, 0);
  });
  ctx.font = fi(px);
  const xs3 = glyphXs(ctx, "Graph");
  const gx = x2 + (M.knowW * px) / REF;
  [..."Graph"].forEach((ch, i) => {
    const st = 11.16 + i * 0.016;
    const k = spring(t - st, SNAPPY);
    const p = outP(i + 26);
    glyph(ctx, ch, gx + xs3[i], 890 + (1 - k) * 60 + easeIn(p) * 60, fi(px), color.green, prog(t, st, st + 0.15) * (1 - p), 0, 1, 0);
  });

  // 칩
  const ck = spring(t - 11.35, SNAPPY);
  const cp = outP(30);
  if (t >= 11.35) {
    ctx.save();
    ctx.globalAlpha = prog(t, 11.35, 11.5) * (1 - cp);
    ctx.font = f(mobile.chip);
    const label = "Pseudo Lab";
    const w = ctx.measureText(label).width;
    const cx = W / 2, cy = 1005 + (1 - ck) * 30;
    ctx.translate(cx, cy); ctx.scale(lerp(0.9, 1, clamp(ck)), lerp(0.9, 1, clamp(ck)));
    ctx.fillStyle = color.chip;
    ctx.fillRect(-w / 2 - 28, -38, w + 56, 76);
    ctx.fillStyle = color.navy; ctx.textAlign = "center";
    ctx.fillText(label, 0, 14);
    ctx.restore();
  }
  // 정보/CTA
  const tail: Array<[string, number, number, number, number]> = [
    ["12 weeks · Oct–Dec 2026", 1110, 11.45, 0.82, mobile.info],
    ["Link in post ↓", 1250, 11.6, 1, mobile.cta],
  ];
  for (const [txt, y, st, op, px_] of tail) {
    if (t < st) continue;
    const k = spring(t - st, SNAPPY);
    ctx.save();
    ctx.globalAlpha = prog(t, st, st + 0.18) * op * (1 - outP(32));
    ctx.font = fs(px_); ctx.fillStyle = color.n50; ctx.textAlign = "center";
    ctx.fillText(txt, W / 2, y + (1 - k) * 24);
    ctx.restore();
  }
}

// ───────────────────────── 녹색 점의 단일 상태 ─────────────────────────
function dotState(t: number): Pt & { r: number } {
  const p0 = tittle(t);
  if (t < 2.55) return p0;
  if (t >= 5.5 && t < 5.8) return { ...SERIES_FIRST, r: 20 }; // 시리즈 장면 뒤 재개 지점
  if (t < 5.8) {
    const P1 = tittle(2.55);
    const k = prog(t, 2.55, 3.0);
    const x = lerp(P1.x, CENTER.x, easeInOut(k));
    const y = lerp(P1.y, CENTER.y, easeInOut(k)) - Math.sin(Math.PI * k) * 200;
    const r = P1.r + (20 - P1.r) * spring(t - 2.62, BOUNCY);
    return { x, y, r };
  }
  if (t < 8.0) {
    const p = hopPos(t);
    let r = lerp(20, 17, prog(t, 5.8, 6.1));
    if (t >= 7.45) r = lerp(17, 1300, easeIn(prog(t, 7.45, 7.98)));
    return { ...p, r };
  }
  if (t < 9.3) {
    const k = easeInOut(prog(t, 8.0, 8.4));
    return { x: lerp(STOPS[2].x, ORBIT.x, k), y: lerp(LINE_Y, ORBIT.y, k), r: lerp(1300, 18, k) };
  }
  if (t < 10.45) {
    const u0 = { x: edgeOrigin() - 6, y: UNDER_Y };
    if (t < 10.1) {
      const k = prog(t, 9.6, 10.05);
      return { x: lerp(ORBIT.x, u0.x, easeInOut(k)), y: lerp(ORBIT.y, u0.y, easeInOut(k)) - Math.sin(Math.PI * k) * 120, r: 18 };
    }
    return { x: lerp(u0.x, 990, easeInOut(prog(t, 10.1, 10.4))), y: UNDER_Y, r: 18 };
  }
  if (t < 13.0) {
    const k = spring(t - 10.45, SOFT);
    return { x: lerp(990, LOGO.x, k), y: lerp(UNDER_Y, LOGO.y, k), r: lerp(18, 16, clamp(k)) };
  }
  // 복귀: 토글 줄의 i 위로 정확히 착지 (t=0 상태와 동일)
  const k = prog(t, 13.0, 13.4);
  const R = tittle(0);
  return {
    x: lerp(LOGO.x, R.x, easeInOut(k)),
    y: lerp(LOGO.y, R.y, easeInOut(k)) - Math.sin(Math.PI * k) * 160,
    r: lerp(16, R.r, easeOut(k)),
  };
}

// ───────────────────────── seek(t): 모든 것은 t로부터 계산 ─────────────────────────
export function render(ctx: Ctx, tIn: number): void {
  const t = ((tIn % DURATION) + DURATION) % DURATION;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.lineCap = "butt"; ctx.lineJoin = "miter"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const dark = t >= 7.98 && t < 13.0;
  ctx.fillStyle = dark ? color.navy : color.n100;
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(dark ? grain.dark : grain.light, 0, 0, W, H);

  const dot = dotState(t);

  if (!dark) {
    let wmA = 1 - prog(t, 7.5, 7.7);
    if (t >= 13.0) wmA = easeOut(prog(t, 13.05, 13.35));
    wordmark(ctx, wmA);
    if (t < 2.95 || t >= 12.9) sceneOpen(ctx, t);
    if (t >= 2.6 && t < 5.5) sceneGraph(ctx, t, dot); // 5.5 이후 수축은 시리즈 장면이 담당
    sceneRoadmap(ctx, t);
  } else {
    sceneKeywords(ctx, t, dot);
    const seg = edgeSegment(t);
    if (seg && t < 11.1) {
      const k = prog(t, 10.45, 10.9);
      ctx.save();
      ctx.globalAlpha = 1 - prog(t, 10.85, 11.05);
      line(ctx, seg[0], seg[1], t < 10.45 ? color.green : mix(color.green, color.n100, k), lerp(7, LOGO_STROKE * LOGO_S, k));
      ctx.restore();
    }
    sceneEnd(ctx, t);
    // 다크 → 라이트: 점에서 라이트 원이 퍼짐
    if (t >= 12.72) {
      const r = lerp(10, 1350, easeIn(prog(t, 12.72, 13.0)));
      circle(ctx, LOGO.x, LOGO.y, r, color.n100);
    }
  }
  // 녹색 점 (항상 맨 위, 하나의 오브젝트)
  circle(ctx, dot.x, dot.y, dot.r, color.green);
  ctx.restore();
}

// ───────────────────────── 삽입 장면: 지식 그래프 시리즈 ─────────────────────────
const SERIES_Y = 660;
const SERIES_X = [220, 380, 540, 700, 860];
export const SERIES_DURATION = 3.3;
const SERIES_FIRST: Pt = { x: SERIES_X[0], y: SERIES_Y };

/** L: 장면 내부 시간 (0..SERIES_DURATION). 앞 장면(그래프 수축)과 뒤 장면(로드맵) 사이를 잇는다 */
/**
 * L: 장면 내부 시간 (등장·퇴장 담당)
 * vt: 실제 영상 시간 (멈춰 있는 홀드 구간에서도 계속 흐르는 대기 모션 담당)
 */
export function renderSeries(ctx: Ctx, L: number, vt = 0): void {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.lineCap = "butt"; ctx.lineJoin = "miter"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color.n100; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(grain.light, 0, 0, W, H);
  wordmark(ctx, 1);

  // 0~0.55: 그래프가 중심 노드로 수축 (원본 5.5~6.05초 구간 재사용)
  if (L < 0.6) sceneGraph(ctx, lerp(5.5, 6.05, prog(L, 0, 0.55)), CENTER);

  const out = 1 - prog(L, 2.8, 3.15);

  // ── 대기 모션 (홀드 구간에서만 강도 1, 등장·퇴장 때는 0으로 수렴) ──
  const idle = prog(L, 1.55, 1.95) * (1 - prog(L, 2.6, 2.8));
  // "?" 노드가 물결처럼 위아래로 출렁임 (Law 노드는 고정: 확정된 첫 번째)
  const nodeY = (i: number) => SERIES_Y + (i === 0 ? 0 : idle * 10 * Math.sin(2 * Math.PI * vt * 0.7 - i * 0.95));
  // 신호: Law에서 출발한 작은 점이 다음 노드들로 흘러가고, 지나간 "?"가 하나씩 반응
  const CYCLE = 1.9, TRAVEL = 1.25;
  const c = ((vt % CYCLE) + CYCLE) % CYCLE;
  const ping = (i: number) => { // 0..1: 신호가 노드 i를 지난 뒤의 진행도, -1: 해당 없음
    const d = c - (i / (SERIES_X.length - 1)) * TRAVEL;
    return d >= 0 && d < 0.55 ? d / 0.55 : -1;
  };
  const nodePt = (i: number): Pt => ({ x: SERIES_X[i], y: nodeY(i) });

  // 노드 사이 엣지: 왼쪽에서 오른쪽으로
  for (let i = 0; i < SERIES_X.length - 1; i++) {
    const st = 0.95 + i * 0.12;
    if (L < st) continue;
    const k = Math.min(1, spring(L - st, SNAPPY));
    const retract = easeIn(prog(L, 2.8 + (3 - i) * 0.04, 3.05 + (3 - i) * 0.04));
    const A = nodePt(i), B = nodePt(i + 1);
    const len = Math.hypot(B.x - A.x, B.y - A.y), ux = (B.x - A.x) / len, uy = (B.y - A.y) / len;
    const a = { x: A.x + ux * 24, y: A.y + uy * 24 };
    const b = { x: B.x - ux * 24, y: B.y - uy * 24 };
    const kk = k * (1 - retract);
    if (kk > 0.01) line(ctx, a, { x: lerp(a.x, b.x, kk), y: lerp(a.y, b.y, kk) }, rgba(color.navy, 0.45), 3);
  }
  // 흐르는 신호 점
  if (idle > 0.01 && c < TRAVEL) {
    const q = (c / TRAVEL) * (SERIES_X.length - 1);
    const i0 = Math.min(SERIES_X.length - 2, Math.floor(q));
    const A = nodePt(i0), B = nodePt(i0 + 1);
    const p = { x: lerp(A.x, B.x, q - i0), y: lerp(A.y, B.y, q - i0) };
    ctx.save(); ctx.globalAlpha = idle * 0.75; circle(ctx, p.x, p.y, 6, color.navy); ctx.restore();
  }
  // "?" 노드: 테두리만, 스프링으로 등장
  for (let i = 1; i < SERIES_X.length; i++) {
    const st = 1.0 + i * 0.12;
    if (L < st) continue;
    const sc = Math.max(0, spring(L - st, BOUNCY)) * (1 - easeIn(prog(L, 2.75 + (4 - i) * 0.04, 3.0 + (4 - i) * 0.04)));
    if (sc <= 0.001) continue;
    const pg = ping(i);
    const e = pg < 0 ? 0 : pg;
    const bump = pg < 0 ? 1 : 1 + idle * 0.18 * Math.sin(Math.PI * Math.min(1, e * 2));
    const wiggle = pg < 0 ? 0 : idle * 0.4 * Math.sin(e * Math.PI * 3) * (1 - e);
    const P = nodePt(i);
    // 신호가 닿으면 퍼져나가는 링
    if (pg >= 0 && idle > 0.01) {
      ctx.save(); ctx.globalAlpha = idle * 0.35 * (1 - e);
      ctx.beginPath(); ctx.arc(P.x, P.y, 24 + 30 * easeOut(e), 0, Math.PI * 2);
      ctx.lineWidth = 2; ctx.strokeStyle = color.navy; ctx.stroke(); ctx.restore();
    }
    ctx.save();
    ctx.translate(P.x, P.y); ctx.scale(sc * bump, sc * bump);
    ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fillStyle = color.n100; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = color.navy; ctx.stroke();
    ctx.rotate(wiggle);
    ctx.font = f(30); ctx.fillStyle = color.navy; ctx.textAlign = "center";
    ctx.fillText("?", 0, 10);
    ctx.restore();
  }
  // "01 Law" 라벨
  if (L >= 1.0) {
    const k = spring(L - 1.0, SNAPPY);
    ctx.save(); ctx.globalAlpha = clamp(k) * out; ctx.textAlign = "center";
    ctx.font = fs(mobile.stepNum, 500); ctx.fillStyle = rgba(color.navy, 0.6);
    ctx.fillText("01", SERIES_X[0], SERIES_Y + 76 + (1 - k) * 24);
    ctx.font = f(mobile.step); ctx.fillStyle = color.navy;
    ctx.fillText("Law", SERIES_X[0], SERIES_Y + 138 + (1 - k) * 24);
    ctx.restore();
  }
  // 헤드라인 (2줄, 글자 단위로 올라옴)
  const lines: Array<[string, number]> = [["First in a series", 430], ["of knowledge graphs.", 516]];
  let n = 0;
  for (const [txt, y] of lines) {
    const px = size.displayXl;
    ctx.font = f(px);
    const xs = glyphXs(ctx, txt);
    [...txt].forEach((ch, i) => {
      const st = 1.1 + n * 0.014;
      const k = spring(L - st, SNAPPY);
      const p = prog(L, 2.8 + n * 0.006, 3.05 + n * 0.006);
      glyph(ctx, ch, 90 + xs[i], y + (1 - k) * 50 + easeIn(p) * 50, f(px), color.navy,
        prog(L, st, st + 0.15) * (1 - p), 0, 1, 0);
      n++;
    });
  }

  // 녹색 점: 중심 → 첫 노드(Law)로 이동해 그 자리에 머묾 (로드맵이 여기서 출발)
  const k = L < 0.55 ? 0 : spring(L - 0.55, SNAPPY);
  const arc = Math.sin(Math.PI * prog(L, 0.55, 0.95)) * 110;
  circle(ctx, lerp(CENTER.x, SERIES_FIRST.x, k), lerp(CENTER.y, SERIES_FIRST.y, k) - arc, 20, color.green);
  ctx.restore();
}
