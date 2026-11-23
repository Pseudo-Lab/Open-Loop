/**
 * 템플릿 프로젝트: 엔진 기능을 모두 쓰는 최소 예시. 새 프로젝트는 이 폴더를 복사해서 장면을 다시 기획한다.
 *   장면 1: 녹색 점 등장 → 장면 2: 말장난(글자 morph) → 장면 3: 엔드카드(점 → 로고, sting 착지) → 루프 복귀
 * 원칙: 모든 화면은 t만으로 계산 · 점 하나가 장면을 잇는다 · 첫 프레임 = 마지막 프레임
 */
import { color, size, mobile, W, H } from "../../engine/tokens";
import { spring, SNAPPY, BOUNCY, clamp, lerp, prog, easeIn, easeOut, easeInOut } from "../../engine/spring";
import { buildMorph, type Glyph } from "../../engine/morph";
import { type Ctx, REF, f, fs, grain, glyph, circle, cw, dotGrid, wordmark, drawLogo } from "../../engine/draw";

// ── 이 프로젝트의 문구 (project.ts의 copy에도 넣을 것) ──
export const COPY = {
  from: "Hide Connections",     // 말장난 원문
  to: "Connections",            // 말장난 결과
  keepFrom: 5,                  // 접두어 삭제형이면 남는 부분의 시작 인덱스, LCS 매칭이면 undefined
  title: ["Project", "Title Here"],
  chip: "Pseudo Lab",
  info: "12 weeks · 2026",
  cta: "Link in post ↓",
};
export const SOURCE = 6; // 장면 원본 길이 (초)

const C = { x: W / 2, y: 600 };
const LOGO = { x: W / 2, y: 380 }, LOGO_S = 3.6;
let morph: Glyph[] = [];
let fromW = 0, toW = 0;

export function measure(ctx: Ctx): void {
  ctx.font = f(REF);
  morph = buildMorph(ctx, COPY.from, COPY.to, COPY.keepFrom);
  fromW = ctx.measureText(COPY.from).width; toW = ctx.measureText(COPY.to).width;
}

export function render(ctx: Ctx, t: number): void {
  const dark = t >= 3.0 && t < 5.4;
  ctx.fillStyle = dark ? color.navy : color.n100; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(dark ? grain.dark : grain.light, 0, 0, W, H);

  // 녹색 점: 0~0.5 등장, 3.0에서 화면을 덮으며 다크로, 5.4~6 복귀해 사라짐 (t=0과 t=6이 같은 상태)
  let r = 18 * Math.max(0, spring(t - 0.15, BOUNCY));
  if (t >= 2.6 && t < 3.0) r = lerp(18, 1300, easeIn(prog(t, 2.6, 3.0)));
  if (t >= 3.0) r = lerp(1300, 16, easeOut(prog(t, 3.0, 3.35)));
  if (t >= 5.4) r = lerp(16, 0, easeInOut(prog(t, 5.4, 5.9)));
  const dotY = t < 3.0 ? C.y : lerp(C.y, LOGO.y, easeInOut(prog(t, 3.2, 3.6)));

  if (!dark) {
    wordmark(ctx, t < 2.6 ? 1 : 0);
    if (t >= 5.4) wordmark(ctx, prog(t, 5.5, 5.9));
    // 말장난: 0.8 등장 → 1.6 변환 → 2.5 퇴장
    const px = size.display2xl, base = 820;
    const x0 = (W - (fromW * px) / REF) / 2, x1 = (W - (toW * px) / REF) / 2;
    for (const g of morph) {
      const w = cw(g.char, px, ctx);
      const appear = prog(t, 0.8 + (g.fromIndex ?? 0) * 0.02, 1.0 + (g.fromIndex ?? 0) * 0.02);
      const leave = prog(t, 2.3, 2.6);
      if (g.role === "out") {
        const p = prog(t, 1.6 + g.order * 0.04, 1.95 + g.order * 0.04);
        glyph(ctx, g.char, x0 + (g.fromX! * px) / REF, base + easeIn(p) * 90, f(px), color.navy, appear * (1 - p), easeIn(p) * 0.4, 1, w);
      } else if (g.role === "keep") {
        const k = t < 1.8 ? 0 : spring(t - 1.8 - g.order * 0.012, SNAPPY);
        glyph(ctx, g.char, lerp(x0 + (g.fromX! * px) / REF, x1 + (g.toX! * px) / REF, k), base + easeIn(leave) * 60, f(px), color.navy, appear * (1 - leave), 0, 1, w);
      } else {
        const s = t < 1.9 ? 0 : Math.max(0, spring(t - 1.9, BOUNCY));
        glyph(ctx, g.char, x1 + (g.toX! * px) / REF, base, f(px), color.green, 1 - leave, 0, s, w);
      }
    }
  } else {
    dotGrid(ctx, 0.1 * prog(t, 3.2, 3.6) * (1 - prog(t, 5.0, 5.3)), color.n100, { x: C.x, y: dotY }, 3);
    // 엔드카드: 로고가 점에서 펼쳐짐 (sting 착지 = 3.6초, project.ts의 music.hit)
    const s = Math.max(0, spring(t - 3.6, BOUNCY)) * (1 - easeIn(prog(t, 5.0, 5.3)));
    drawLogo(ctx, LOGO, LOGO_S * s, color.n100);
    const out = 1 - prog(t, 5.0, 5.3);
    const line = (txt: string, y: number, st: number, font_: string, fill: string) => {
      const k = spring(t - st, SNAPPY);
      ctx.save(); ctx.globalAlpha = clamp(prog(t, st, st + 0.15)) * out; ctx.font = font_; ctx.fillStyle = fill; ctx.textAlign = "center";
      ctx.fillText(txt, W / 2, y + (1 - k) * 40); ctx.restore();
    };
    line(COPY.title[0], 790, 3.75, f(size.display2xl), color.n100);
    line(COPY.title[1], 890, 3.82, f(size.display2xl), color.n100);
    line(COPY.chip, 1000, 3.95, f(mobile.chip), color.chip);
    line(COPY.info, 1100, 4.05, fs(mobile.info), color.n50);
    line(COPY.cta, 1250, 4.15, fs(mobile.cta), color.n50);
  }
  if (t >= 5.3 && t < 5.4) { /* 다크 → 라이트 전환 프레임 */ }
  circle(ctx, C.x, dotY, r, color.green);
}
