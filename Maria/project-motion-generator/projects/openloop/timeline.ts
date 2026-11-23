import { makeTimeline } from "../../engine/timeline";

/**
 * OpenLoop: 원본 18.8초 장면 → 약 35초 영상.
 * 앞선 두 영상의 피드백("다 너무 빠르다", "읽기 전에 넘어간다")을 처음부터 반영해 말장난·문구마다 홀드를 넉넉히 둠.
 * 2026-11-15 피드백 "1.4배 느리게" → 전체 1.4배 (아래 표의 d는 1배 기준)
 */
const PACE = 1.4;
export const timeline = makeTimeline([
  { scene: "film", from: 0.0, to: 0.25, d: 0.9, note: "LOCAL ONLY 토글 읽기" },
  { scene: "film", from: 0.25, to: 1.95, d: 1.9, note: "클릭 → 손잡이(점)가 튀어나감, LOCAL ONLY → GLOBAL" },
  { scene: "film", from: 1.95, to: 1.96, d: 1.3, note: "홀드: GLOBAL" },
  { scene: "film", from: 1.96, to: 3.84, d: 2.2, note: "Why OpenLoop? + OPEN SOURCE RELATIONS 등장" },
  { scene: "film", from: 3.84, to: 3.85, d: 1.0, note: "홀드: OPEN SOURCE RELATIONS 읽기" },
  { scene: "film", from: 3.85, to: 5.0, d: 1.4, note: "OPENREL로 압축 + 캡션" },
  { scene: "film", from: 5.0, to: 5.01, d: 2.2, note: "홀드: 캡션 읽기" },
  { scene: "film", from: 5.01, to: 6.6, d: 1.8, note: "퇴장 → 루프 링 그리기, 점이 맨 위 단계로" },
  { scene: "film", from: 6.6, to: 10.0, d: 4.0, note: "점이 여섯 단계를 한 바퀴 → 안쪽에 원칙 세 줄" },
  { scene: "film", from: 10.0, to: 10.01, d: 2.6, note: "홀드: 루프와 원칙 읽기" },
  { scene: "film", from: 10.01, to: 12.93, d: 3.3, note: "15주 마일스톤: BUILD → CURATE → DEVELOP → SCALE" },
  { scene: "film", from: 12.93, to: 12.94, d: 1.8, note: "홀드: 마일스톤 읽기" },
  { scene: "film", from: 12.94, to: 14.5, d: 1.9, note: "점이 화면을 덮음 → 다크 → 평가 기준 궤도" },
  { scene: "film", from: 14.5, to: 15.3, d: 1.2, note: "LOOP 일자로 → 글자 순서가 뒤집혀 POOL" },
  { scene: "film", from: 15.3, to: 15.7, d: 1.5, note: "밑줄 + 캡션 읽기" },
  { scene: "film", from: 15.7, to: 17.2, d: 1.8, note: "밑줄 → 로고, 엔드카드 (엔딩 사운드 착지)" },
  { scene: "film", from: 17.2, to: 17.21, d: 2.6, note: "엔드카드 홀드" },
  { scene: "film", from: 17.21, to: 18.8, d: 1.9, note: "루프 복귀 → LOCAL ONLY 토글" },
]).scaled(PACE);
