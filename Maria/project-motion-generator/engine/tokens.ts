// 피그마 Variables(Color / Typography)를 그대로 옮긴 토큰
export const color = {
  green: "#16A774",   // Pseudo Green (Main) — 유일한 액센트
  navy: "#13222B",    // Pseudo Navy (Main) — 다크 배경, 본문 텍스트
  n100: "#F3F1ED",    // Neutral-100 — 라이트 캔버스
  n50: "#F6FAF2",     // Neutral-50 — 보조 서피스
  chip: "#F5FBCC",    // Yellowy Green (Point) — 칩
} as const;

export const size = {
  display2xl: 88, displayXl: 72, displayLg: 64, displayM: 56,
  headline1: 46, headline2: 40, headline3: 32,
  bodyXl: 28, bodyLg: 24,
} as const;

/** 모바일 가독성 기준 (1080px 영상 → 휴대폰 약 0.36배, 36px ≈ 13pt) */
export const mobile = {
  nodeLabel: 36, edgeLabel: 30, stepNum: 32, step: 46, sub: 36,
  orbit: 46, chip: 40, info: 36, cta: 40,
} as const;

export const font = {
  slab: "'Hepta Slab'",
  // TT Barrels Italic(상용)의 임시 대체. 라이선스 파일을 받으면 여기만 교체
  italic: "'Fraunces'",
  sans: "'IBM Plex Sans'",
} as const;

export const W = 1080;
export const H = 1350;
export const FPS = 60;
