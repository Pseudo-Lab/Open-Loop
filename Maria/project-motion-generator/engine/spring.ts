export interface SpringConfig { stiffness: number; damping: number; mass?: number }

/** 닫힌형 감쇠 스프링: t초 경과 시 0→1 진행값 (오버슈트 포함) */
export function spring(t: number, { stiffness, damping, mass = 1 }: SpringConfig): number {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

export const SNAPPY: SpringConfig = { stiffness: 320, damping: 18 };   // 작은 오버슈트
export const BOUNCY: SpringConfig = { stiffness: 260, damping: 12 };   // 착지용
export const SOFT: SpringConfig = { stiffness: 140, damping: 20 };     // 오버슈트 거의 없음

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** t를 [a,b] 구간의 0..1로 */
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeIn = (k: number) => k * k * k;
export const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
