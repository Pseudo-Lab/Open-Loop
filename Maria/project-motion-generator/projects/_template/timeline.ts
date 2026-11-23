import { makeTimeline } from "../../engine/timeline";

/** 장면 원본 시간을 영상에서 몇 초로 보여줄지. 속도·읽는 시간 피드백은 여기 d만 고친다 */
export const timeline = makeTimeline([
  { scene: "film", from: 0.0, to: 0.8, d: 0.9, note: "점 등장" },
  { scene: "film", from: 0.8, to: 1.55, d: 1.0, note: "말장난 원문 등장 + 읽기" },
  { scene: "film", from: 1.55, to: 2.3, d: 1.0, note: "말장난 변환" },
  { scene: "film", from: 2.3, to: 2.31, d: 1.2, note: "변환 결과 홀드 (읽는 시간)" },
  { scene: "film", from: 2.31, to: 3.6, d: 1.4, note: "점이 화면을 덮음 → 다크 → 로고 위치로" },
  { scene: "film", from: 3.6, to: 4.4, d: 1.0, note: "로고 + 엔드카드 등장 (sting 착지)" },
  { scene: "film", from: 4.4, to: 4.41, d: 2.5, note: "엔드카드 홀드" },
  { scene: "film", from: 4.41, to: 6.0, d: 1.6, note: "루프 복귀" },
]);
