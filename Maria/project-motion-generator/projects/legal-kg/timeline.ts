import { makeTimeline } from "../../engine/timeline";
import { SERIES_DURATION } from "./film";

/** 법률 지식 그래프: 본편(film) 사이에 시리즈 장면(series) 삽입. 최종 31.5초 */
export const timeline = makeTimeline([
  { scene: "film", from: 0.0, to: 0.25, d: 1.15, note: "오프닝: Hide Connections 읽기" },
  { scene: "film", from: 0.25, to: 2.0, d: 2.2195, note: "클릭 → Connections" },
  { scene: "film", from: 2.0, to: 2.5, d: 0.4025, note: "Connections 홀드 (짧게: 바로 그래프로)" },
  { scene: "film", from: 2.5, to: 5.0, d: 3.312, note: "그래프 생성 + Legal ease" },
  { scene: "film", from: 5.0, to: 5.5, d: 2.07, note: "Legal ease 홀드" },
  { scene: "series", from: 0, to: 2.0, d: 2.0, note: "시리즈: 그래프 수축 → 노드 줄 + 헤드라인 등장" },
  { scene: "series", from: 2.0, to: 2.1, d: 2.4, note: "시리즈 홀드: 헤드라인 읽는 시간" },
  { scene: "series", from: 2.1, to: SERIES_DURATION, d: SERIES_DURATION - 2.1, note: "시리즈 퇴장 → 로드맵" },
  { scene: "film", from: 5.5, to: 7.45, d: 3.0245, note: "로드맵 (Law 노드에서 출발)" },
  { scene: "film", from: 7.45, to: 8.6, d: 1.4605, note: "화면 채움 → 궤도 진입" },
  { scene: "film", from: 8.6, to: 9.3, d: 1.84, note: "궤도 회전" },
  { scene: "film", from: 9.3, to: 9.75, d: 0.805, note: "궤도 → KNOWLEDGE 일자로 펴짐" },
  { scene: "film", from: 9.75, to: 10.1, d: 1.0925, note: "KNOWL 퇴장, EDGE 가운데로 + 녹색" },
  { scene: "film", from: 10.1, to: 10.35, d: 1.495, note: "EDGE 읽는 시간: 밑줄(엣지)을 천천히 그음" },
  { scene: "film", from: 10.35, to: 10.45, d: 0.23, note: "EDGE 퇴장 → 로고로" },
  { scene: "film", from: 10.45, to: 12.0, d: 1.955, note: "로고 + 엔드카드" },
  { scene: "film", from: 12.0, to: 12.5, d: 3.335, note: "엔드카드 홀드" },
  { scene: "film", from: 12.5, to: 13.5, d: 1.4835, note: "루프 복귀" },
]);
