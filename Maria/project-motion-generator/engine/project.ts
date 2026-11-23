import type { Ctx } from "./draw";
import type { Timeline } from "./timeline";

/**
 * 말장난 설명: 영어가 익숙하지 않은 사람도 이해할 수 있게 결과물(WORDPLAY.md)에 함께 나감.
 * 단어 뜻 → 어떻게 바뀌는지 → 그래서 무슨 뜻인지 → 프로젝트와의 연결 순서로 쓴다.
 */
export interface Wordplay {
  scene: string;
  /** 말장난이 완성되는 영상 시각 (timeline에서 계산 → 속도를 바꿔도 자동으로 맞음) */
  at: number;
  from: string;
  to: string;
  /** 글자/단어가 어떻게 바뀌는지 (화면에서 일어나는 일) */
  how: string;
  /** 등장 단어들의 뜻과 발음 (한국어) */
  words: Array<{ word: string; reading?: string; meaning: string }>;
  /** 바뀌기 전후로 의미가 어떻게 뒤집히는지 */
  meaning: string;
  /** 이 프로젝트에서 왜 이 말장난인지 */
  why: string;
  /** 알아두면 재미가 커지는 배경 (선택) */
  note?: string;
}

/** 장면 해설: 영상 해설서(GUIDE.md)의 "장면별 해설". 시간은 장면 원본 시각 → 영상 시각으로 자동 변환 */
export interface SceneNote {
  name: string;
  /** timeline의 scene 이름 (기본 "film") */
  scene?: string;
  from: number;
  to: number;
  /** 화면에서 보이는 것 */
  screen: string;
  /** 이 장면이 전하는 의미 */
  meaning: string;
}

/** 화면에 나오는 전문 용어 해설 (말장난이 아닌 키워드). WORDPLAY.md의 "키워드 해설"로 출력 */
export interface Glossary {
  scene: string;
  /** 장면 전체가 무슨 뜻인지 */
  summary: string;
  terms: Array<{ term: string; reading?: string; meaning: string; where?: string }>;
}

/** 모든 프로젝트가 구현하는 계약. 엔진(빌드·렌더·음악·검수)은 이것만 보고 동작한다 */
export interface Project {
  id: string;
  title: string;
  /** 화면에 나오는 모든 글자 (폰트 서브셋용). 빠지면 시스템 폰트로 대체돼 보임 */
  copy: string[];
  /** 이탤릭 폰트로 쓰는 글자 */
  italicCopy?: string[];
  timeline: Timeline;
  /** 폰트 로드 후 1회: 글자 폭 측정 등 */
  init(ctx: Ctx): void;
  /** 영상 시각 t의 한 프레임. 반드시 t만으로 결정 (상태·타이머·Math.random 금지) */
  draw(ctx: Ctx, frame: { scene: string; t: number; video: number }): void;
  /** 장면별 해설 (결과물 GUIDE.md로 출력) */
  scenes: SceneNote[];
  /** 말장난 설명 (GUIDE.md에 포함) */
  wordplays: Wordplay[];
  /** 키워드 해설 (선택) */
  glossary?: Glossary[];
  /** 검토용 스틸: 이름 → 영상 초 */
  stills: Record<string, number>;
  music: {
    /** 엔딩 sting 착지음이 와야 하는 영상 시각 (보통 엔드카드 로고 등장) */
    hit: number;
    /** 곡의 풀 사운드 진입을 맞추고 싶은 영상 이벤트들 */
    events: Record<string, number>;
    /** 승인된 곡 시작 지점을 고정하고 싶을 때 (없으면 align-music.py가 자동 선택) */
    offset?: number;
    /**
     * 코드로 작곡한 sting 대신 쓸 브랜드 사운드 파일 (원본 그대로, 조옮김 없음).
     * file: 레포 루트 기준 경로 (예: "music/brand-sting.wav", git 제외)
     * landing: 파일 안에서 착지음이 오는 초 (없으면 sting-landing.py가 자동 측정)
     */
    sting?: { file: string; landing?: number };
  };
}
