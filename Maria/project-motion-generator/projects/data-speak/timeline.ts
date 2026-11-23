import { makeTimeline } from "../../engine/timeline";

/**
 * 데이터는 여전히 말하지 않는다: 원본 14초 장면 → 영상. 읽는 시간은 홀드 구간으로
 * 2026-11-02 피드백 "다 너무 빠르다" → 전체 1.3배 (아래 표의 d는 1배 기준)
 */
const PACE = 1.3;
const QUESTIONS_PACE = 1.2;
export const timeline = makeTimeline([
  { scene: "film", from: 0.0, to: 0.6, d: 1.2, note: "Data speaks. 읽기" },
  { scene: "film", from: 0.6, to: 1.8, d: 1.4, note: "단어 삽입 → Data still does not speak." },
  { scene: "film", from: 1.8, to: 1.81, d: 1.6, note: "홀드: 문장 읽기" },
  { scene: "film", from: 1.81, to: 4.6, d: 3.1, note: "마침표 → 데이터 포인트, 산점도·추세선, CAUSAL 등장" },
  { scene: "film", from: 4.6, to: 5.2, d: 0.8, note: "CAUSAL → CASUAL 자리 교환 + 캡션" },
  { scene: "film", from: 5.2, to: 5.21, d: 2.0, note: "홀드: 캡션 읽기" },
  { scene: "film", from: 5.21, to: 5.8, d: 0.714, note: "산점도 수축 → 점으로 모임" },
  // 2026-11-02 피드백: "Four questions, every week" 구간만 추가로 1.2배 느리게
  { scene: "film", from: 5.8, to: 8.06, d: 2.736 * QUESTIONS_PACE, note: "네 가지 질문 (점이 하나씩 짚음)" },
  { scene: "film", from: 8.06, to: 8.07, d: 1.8 * QUESTIONS_PACE, note: "홀드: 질문 읽기" },
  { scene: "film", from: 8.07, to: 9.75, d: 1.95, note: "점이 화면을 덮음 → 다크 → 키워드 궤도" },
  { scene: "film", from: 9.75, to: 10.55, d: 1.1, note: "QUESTIONS 일자로 → IONS 퇴장 → QUEST" },
  { scene: "film", from: 10.55, to: 10.95, d: 1.6, note: "밑줄(점의 궤적) + 캡션 읽기" },
  { scene: "film", from: 10.95, to: 12.2, d: 1.6, note: "밑줄 → 로고 대각선, 엔드카드 (sting 착지)" },
  { scene: "film", from: 12.2, to: 12.21, d: 2.8, note: "엔드카드 홀드" },
  { scene: "film", from: 12.21, to: 14.0, d: 1.9, note: "루프 복귀 → Data speaks." },
]).scaled(PACE);
