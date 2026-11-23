// 브라우저 런타임: 폰트 로드 → 프로젝트 init → window.seek(t)
import { W, H, FPS } from "./tokens";
import { initGrain } from "./draw";
import type { Project } from "./project";

declare global {
  interface Window {
    seek: (t: number) => void; filmReady: Promise<void>; DURATION: number; FPS: number;
    STILLS: Record<string, number>;
  }
}

export function boot(p: Project): void {
  const canvas = document.getElementById("stage") as HTMLCanvasElement;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  window.DURATION = p.timeline.duration; window.FPS = FPS; window.STILLS = p.stills;
  window.filmReady = (async () => {
    const all = p.copy.join("");
    await Promise.all([
      document.fonts.load("400 100px 'Hepta Slab'", all),
      document.fonts.load("400 28px 'IBM Plex Sans'", all),
      document.fonts.load("500 28px 'IBM Plex Sans'", all),
      ...(p.italicCopy?.length ? [document.fonts.load("italic 400 100px 'Fraunces'", p.italicCopy.join(""))] : []),
    ]);
    await document.fonts.ready;
    p.init(ctx);
    initGrain();
  })();
  window.seek = (t: number) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.lineCap = "butt"; ctx.lineJoin = "miter"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    p.draw(ctx, p.timeline.warp(t));
    ctx.restore(); // 프레임 사이 캔버스 상태 누수 방지 (루프 이음새 버그의 원인이었음)
  };
}
