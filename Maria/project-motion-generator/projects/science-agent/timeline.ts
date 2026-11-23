import { makeTimeline } from "../../engine/timeline";

/**
 * Science Agent Leaderboard: 원본 18.6초 장면 → 약 47초 영상.
 * 지난 영상들의 피드백("다 너무 빠르다", "읽기 전에 넘어간다", OpenLoop 1.4배 느리게)을 처음부터 반영해
 * 말장난과 두 줄 캡션마다 약 2.6~3초 홀드를 둠. 전체 속도는 PACE 하나로 조절.
 */
const PACE = 1.0;
/** 2026-11-22 피드백 "Rank agents · Built so far 장면이 너무 빠르다" → 두 장면만 1.4배 느리게 */
const SLOW = 1.4;
export const timeline = makeTimeline([
  { scene: "film", from: 0.0, to: 0.3, d: 1.0, note: "실행 카드 읽기 (Agent run #01, Run)" },
  { scene: "film", from: 0.3, to: 2.25, d: 2.6, note: "Run 클릭 → 점 깜빡임 → 로그 2줄 → VALID." },
  { scene: "film", from: 2.25, to: 2.26, d: 0.8, note: "홀드: VALID." },
  { scene: "film", from: 2.26, to: 3.8, d: 2.0, note: "metrics: missing → IN이 끼어들어 INVALID. + 캡션" },
  { scene: "film", from: 3.8, to: 3.81, d: 2.8, note: "홀드: INVALID. + 캡션 두 줄 읽기" },
  { scene: "film", from: 3.81, to: 7.0, d: 4.0 * SLOW, note: "퇴장 → Rank agents, not models. → 점이 관문 여섯 개 통과 → 캡션" },
  { scene: "film", from: 7.0, to: 7.01, d: 2.2 * SLOW, note: "홀드: 관문 + 캡션 읽기" },
  { scene: "film", from: 7.01, to: 8.15, d: 1.5, note: "평가 기준 칩 4개 + EVALUATE." },
  { scene: "film", from: 8.15, to: 8.16, d: 1.2, note: "홀드: EVALUATE. 읽기" },
  { scene: "film", from: 8.16, to: 9.4, d: 1.7, note: "E·A·T가 빠져 VALUE. + 캡션" },
  { scene: "film", from: 9.4, to: 9.41, d: 2.6, note: "홀드: VALUE. + 캡션 두 줄 읽기" },
  { scene: "film", from: 9.41, to: 12.95, d: 3.8 * SLOW, note: "Built so far 체크 4개 → Next 3개" },
  { scene: "film", from: 12.95, to: 12.96, d: 3.0 * SLOW, note: "홀드: 진행 상황 읽기" },
  { scene: "film", from: 12.96, to: 14.05, d: 1.5, note: "점이 화면을 덮음 → 다크 → SEARCH." },
  { scene: "film", from: 14.05, to: 14.06, d: 0.8, note: "홀드: SEARCH. 읽기" },
  { scene: "film", from: 14.06, to: 15.1, d: 1.4, note: "RE가 끼어들어 RESEARCH. + 캡션" },
  { scene: "film", from: 15.1, to: 15.11, d: 2.6, note: "홀드: RESEARCH. + 캡션 두 줄 읽기" },
  { scene: "film", from: 15.11, to: 17.2, d: 2.6, note: "점 → 로고 (브랜드 사운드 착지), 엔드카드" },
  { scene: "film", from: 17.2, to: 17.21, d: 2.6, note: "엔드카드 홀드" },
  { scene: "film", from: 17.21, to: 18.6, d: 1.8, note: "루프 복귀 → 실행 카드" },
]).scaled(PACE);
