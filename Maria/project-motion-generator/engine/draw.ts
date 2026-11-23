// 브랜드 공용 그리기 헬퍼: 모든 프로젝트가 공유
import { color, font, W, H } from "./tokens";
import { clamp, lerp } from "./spring";
import { LOGO_D, LOGO_CENTER, WORDMARK_D } from "./logo";

export type Ctx = CanvasRenderingContext2D;
export interface Pt { x: number; y: number }

export const REF = 100; // 글자 위치는 100px에서 측정 후 비례 축소
export const f = (px: number, w = 400) => `${w} ${px}px ${font.slab}`;
export const fs = (px: number, w = 400) => `${w} ${px}px ${font.sans}`;
export const fi = (px: number) => `italic 400 ${px}px ${font.italic}`;

export function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mix(a: string, b: string, k: number): string {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(",")})`;
}
export function rgba(c: string, a: number): string {
  const [r, g, b] = hex(c);
  return `rgba(${r},${g},${b},${clamp(a)})`;
}

let logoPath: Path2D | null = null;
export const getLogo = () => (logoPath ??= new Path2D(LOGO_D));
/** 로고 좌표 → 화면 좌표 (배율 s, 별 중심이 c에 오도록) */
export const logoPt = (p: Pt, c: Pt, s: number): Pt => ({ x: c.x + (p.x - LOGO_CENTER.x) * s, y: c.y + (p.y - LOGO_CENTER.y) * s });
export function drawLogo(ctx: Ctx, c: Pt, s: number, fill: string, alpha = 1) {
  if (s <= 0.001 || alpha <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  ctx.translate(c.x, c.y); ctx.scale(s, s); ctx.translate(-LOGO_CENTER.x, -LOGO_CENTER.y);
  ctx.fillStyle = fill; ctx.fill(getLogo());
  ctx.restore();
}


// ───────────────────────── 정적 그레인 (시드 고정) ─────────────────────────
export function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** 정적 그레인 텍스처 (initGrain 이후 사용) */
export const grain = {} as { light: HTMLCanvasElement; dark: HTMLCanvasElement };
export function makeGrain(c: string, maxA: number, seed: number): HTMLCanvasElement {
  const g = document.createElement("canvas");
  g.width = W / 2; g.height = H / 2;
  const gx = g.getContext("2d")!;
  const img = gx.createImageData(g.width, g.height);
  const [r, gg, b] = hex(c);
  const rnd = mulberry32(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = r; img.data[i + 1] = gg; img.data[i + 2] = b;
    img.data[i + 3] = Math.floor(rnd() * rnd() * 255 * maxA);
  }
  gx.putImageData(img, 0, 0);
  return g;
}
export function initGrain(): void {
  grain.light = makeGrain(color.navy, 0.22, 7);
  grain.dark = makeGrain(color.n100, 0.12, 11);
}

// ───────────────────────── 그리기 헬퍼 ─────────────────────────
export function glyph(ctx: Ctx, ch: string, x: number, y: number, font_: string, fill: string, alpha = 1, rot = 0, scale = 1, w = 0) {
  if (alpha <= 0.001 || ch === " ") return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  ctx.font = font_;
  ctx.fillStyle = fill;
  // 피벗: 글자 하단 중앙
  ctx.translate(x + w / 2, y);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  ctx.fillText(ch, -w / 2, 0);
  ctx.restore();
}
export function rrect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export function circle(ctx: Ctx, x: number, y: number, r: number, fill: string) {
  if (r <= 0) return;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}
export function line(ctx: Ctx, a: Pt, b: Pt, stroke: string, w: number) {
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.stroke();
}
export const cw = (ch: string, px: number, ctx: Ctx, fnt = f) => { ctx.font = fnt(px); return ctx.measureText(ch).width; };

// 하프톤 도트 그리드: 녹색 점 근처의 도트가 커짐
export function dotGrid(ctx: Ctx, alpha: number, c: string, dot: Pt, boost: number) {
  if (alpha <= 0.001) return;
  const gap = 36;
  ctx.fillStyle = rgba(c, alpha);
  for (let y = gap / 2; y < H; y += gap) {
    for (let x = gap / 2; x < W; x += gap) {
      const d2 = (x - dot.x) ** 2 + (y - dot.y) ** 2;
      const r = 1.7 + boost * Math.exp(-d2 / (2 * 150 * 150));
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }
}

export function cursor(ctx: Ctx, p: Pt, scale: number, alpha: number) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  ctx.translate(p.x, p.y); ctx.scale(scale * 1.6, scale * 1.6);
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 24); ctx.lineTo(6.2, 18.5); ctx.lineTo(10.4, 27.6);
  ctx.lineTo(14.2, 25.8); ctx.lineTo(10.1, 17); ctx.lineTo(18, 16.4); ctx.closePath();
  ctx.fillStyle = color.navy; ctx.fill();
  ctx.lineWidth = 1.6; ctx.strokeStyle = color.n50; ctx.lineJoin = "round"; ctx.stroke();
  ctx.restore();
}

export function wordmark(ctx: Ctx, alpha: number) {
  if (alpha <= 0) return;
  // 실제 로고 (높이 약 50px) + 워드마크
  drawLogo(ctx, { x: 92, y: 90 }, 0.58, color.navy, alpha);
  // 글자 로고 SVG (154×30 → 배율 1.3)
  wordPaths ??= WORDMARK_D.map((d) => new Path2D(d));
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  ctx.translate(124, 73); ctx.scale(1.3, 1.3);
  ctx.fillStyle = color.navy;
  for (const p of wordPaths) ctx.fill(p);
  ctx.restore();
}
let wordPaths: Path2D[] | null = null;
