/**
 * 타임라인 워프: 장면 코드는 자기만의 "원본 시간"으로 짜고,
 * 실제 영상에서 각 구간을 몇 초로 보여줄지(속도·읽는 시간)는 이 표에서만 조절한다.
 *   - 빠르다/느리다 피드백 → 장면 코드를 건드리지 않고 d 값만 수정
 *   - 홀드(읽는 시간) → 짧은 원본 구간 [from,to]를 긴 d로 늘림
 * scene 이름으로 여러 장면 함수를 오갈 수 있음 (예: 본편 "film" 사이에 "series" 삽입)
 */
export interface Segment { scene: string; from: number; to: number; d: number; note: string }
export interface Frame { scene: string; t: number; video: number }
export interface Timeline {
  segments: readonly Segment[];
  duration: number;
  warp(videoT: number): Frame;
  /**
   * 장면의 원본 시각 → 영상 시각 (스틸, 음악 이벤트 계산용).
   * 같은 원본 시각이 두 구간의 경계에 걸치면(사이에 다른 장면이 삽입된 경우) pick으로 앞/뒤를 고름
   */
  unwarp(scene: string, t: number, pick?: "first" | "last"): number;
  /** 모든 구간 d에 배율 적용 (except에 든 장면은 제외). "전체를 조금 느리게" 같은 피드백용 */
  scaled(k: number, except?: string[]): Timeline;
}

export function makeTimeline(segments: readonly Segment[]): Timeline {
  const starts: number[] = [];
  let acc = 0;
  for (const s of segments) {
    if (!(s.d > 0) || !(s.to >= s.from)) throw new Error(`bad segment: ${s.note}`);
    starts.push(acc); acc += s.d;
  }
  const duration = acc;
  return {
    segments, duration,
    warp(t) {
      const tt = ((t % duration) + duration) % duration;
      for (let i = segments.length - 1; i >= 0; i--) {
        if (tt < starts[i]) continue;
        const s = segments[i], u = Math.min(tt - starts[i], s.d) / s.d;
        return { scene: s.scene, t: s.from + u * (s.to - s.from), video: tt };
      }
      return { scene: segments[0].scene, t: segments[0].from, video: tt };
    },
    unwarp(scene, o, pick = "first") {
      const order = segments.map((_, i) => i);
      if (pick === "last") order.reverse();
      for (const i of order) {
        const s = segments[i];
        if (s.scene === scene && o >= s.from && o <= s.to) return starts[i] + (s.to === s.from ? 0 : ((o - s.from) / (s.to - s.from)) * s.d);
      }
      throw new Error(`time ${o} not in scene ${scene}`);
    },
    scaled(k, except = []) {
      return makeTimeline(segments.map((s) => (except.includes(s.scene) ? s : { ...s, d: s.d * k })));
    },
  };
}
