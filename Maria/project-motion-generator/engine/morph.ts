export type GlyphRole = "keep" | "out" | "in";
export interface Glyph {
  char: string;
  role: GlyphRole;
  order: number;        // 같은 role 안에서의 순서 (스태거용)
  fromX: number | null; // 원래 문자열 기준 글자 왼쪽 x
  toX: number | null;   // 목표 문자열 기준 글자 왼쪽 x
  fromIndex: number | null;
  toIndex: number | null;
}

/** 접두어 폭으로 측정 → 커닝이 반영된 글자 위치 */
export function glyphXs(ctx: CanvasRenderingContext2D, text: string): number[] {
  const xs: number[] = [];
  for (let i = 0; i < text.length; i++) xs.push(ctx.measureText(text.slice(0, i)).width);
  return xs;
}

function lcsPairs(a: string, b: string): Array<[number, number]> {
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const pairs: Array<[number, number]> = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { pairs.push([i, j]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/**
 * from → to 글자 매칭.
 * keepFrom을 주면 LCS 대신 "from[keepFrom..] 이 to 전체로 남는다"로 고정 (접두어 삭제형 말장난용).
 */
export function buildMorph(
  ctx: CanvasRenderingContext2D, from: string, to: string, keepFrom?: number,
  /** 직접 짝 지정 [from 인덱스, to 인덱스]: 중간 삽입·글자 맞바꾸기처럼 LCS로는 의도가 안 나오는 경우 */
  explicit?: Array<[number, number]>,
): Glyph[] {
  const fx = glyphXs(ctx, from), tx = glyphXs(ctx, to);
  const pairs: Array<[number, number]> = explicit
    ? explicit.map(([i, j]) => {
        if (from[i] !== to[j]) throw new Error(`morph pair ${i}->${j}: "${from[i]}" != "${to[j]}"`);
        return [i, j] as [number, number];
      })
    : keepFrom !== undefined
    ? [...to].map((_, j) => [keepFrom + j, j] as [number, number])
    : lcsPairs(from, to);
  const kf = new Set(pairs.map(([i]) => i)), kt = new Set(pairs.map(([, j]) => j));
  const out: Glyph[] = [];
  pairs.forEach(([i, j], n) => out.push({ char: from[i], role: "keep", order: n, fromX: fx[i], toX: tx[j], fromIndex: i, toIndex: j }));
  let n = 0;
  [...from].forEach((c, i) => { if (!kf.has(i)) out.push({ char: c, role: "out", order: n++, fromX: fx[i], toX: null, fromIndex: i, toIndex: null }); });
  n = 0;
  [...to].forEach((c, j) => { if (!kt.has(j)) out.push({ char: c, role: "in", order: n++, fromX: null, toX: tx[j], fromIndex: null, toIndex: j }); });
  return out;
}
