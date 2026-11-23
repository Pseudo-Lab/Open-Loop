import type { Project } from "../../engine/project";
import { measure, render, COPY } from "./film";
import { timeline } from "./timeline";

const at = (t: number) => timeline.unwarp("film", t);

const project: Project = {
  id: "science-agent",
  title: "Science Agent Leaderboard",
  copy: [
    COPY.runTitle, COPY.runBtn, ...COPY.logs, COPY.valid, COPY.invalid, ...COPY.hookCap,
    COPY.pipeHead, ...COPY.pipe, COPY.pipeCap, COPY.evalLabel, ...COPY.criteria, COPY.evaluate, COPY.value, ...COPY.evalCap,
    COPY.builtHead, ...COPY.built, COPY.nextHead, ...COPY.next, COPY.search, COPY.research, ...COPY.searchCap,
    COPY.title, COPY.chip, COPY.info, COPY.cta,
  ],
  italicCopy: [COPY.titleItalic],
  timeline,
  init: measure,
  draw: (ctx, fr) => render(ctx, fr.t, fr.video),
  scenes: [
    { name: "오프닝: Run → VALID → INVALID", from: 0, to: 4.1,
      screen: "\"Agent run #01\" 실행 카드. 제목 옆의 녹색 점이 상태 표시등이다. 커서가 Run을 누르면 점이 깜빡이고(실행 중), 로그에 exit code 0 ✓ · output written ✓이 찍힌다. 점이 날아가 큰 글자 VALID의 마침표가 된다. 이어서 세 번째 로그 metrics: missing ✗가 뜨고, 앞에 녹색 IN이 끼어들어 INVALID.가 된다. 캡션 \"Exit 0 isn’t a result. No metric, no rank.\"(종료 코드 0은 결과가 아니다. 지표가 없으면 순위도 없다.)",
      meaning: "README의 '파이프라인 고도화'. 하위 프로세스가 종료 코드 0을 반환해도 최종 지표가 없으면 실패로 처리한다. 겉으로 성공처럼 보이는 실행을 걸러내는 것이 이 리더보드의 출발점." },
    { name: "관문 여섯 개", from: 4.1, to: 7.3,
      screen: "\"Rank agents, not models.\"(모델이 아니라 에이전트의 순위를 매긴다) 아래 세로 파이프라인. 점이 Define the task → Isolate the run → Run the agent → Validate the schema → Check the metric → Publish to the board를 차례로 통과하고, 지나간 관문이 채워진다. 캡션 \"Only fully checked runs reach the board.\"(모든 검사를 통과한 실행만 보드에 오른다)",
      meaning: "README의 공개 실행 파이프라인(Task 정의 → 독립 실행 환경 → Agent 실행 → 산출물·스키마 검증 → 공식 지표 확인 → 공개 데이터 생성 → Leaderboard 반영). 실행마다 별도 작업 공간을 쓰고 이전 실행 상태를 재사용하지 않는다." },
    { name: "평가 기준 → VALUE", from: 7.3, to: 9.7,
      screen: "\"What we evaluate\"(우리가 평가하는 것) 아래 칩 네 개: Correctness(정답 정확도) · Tool use(도구 활용) · Cost(비용) · Reproducibility(재현성). 그 아래 EVALUATE.에서 E·A·T가 떨어지고 VALUE.만 남아 녹색이 된다. 캡션 \"Not just the answer. The design behind it.\"(정답만이 아니라, 그 뒤의 설계까지)",
      meaning: "README '우리가 평가하는 것': 모델 성능이 아니라 Agent 설계 능력을 본다." },
    { name: "지금까지 / 다음", from: 9.7, to: 13.0,
      screen: "\"Built so far\"(지금까지 만든 것): 점이 Public challenge · Evaluation framework · Isolated run pipeline · Leaderboard MVP를 하나씩 체크한다. 이어 \"Next\"(다음): More science tasks & models · Multi-agent benchmarks · Autonomous research agents를 점선 원으로 건너간다.",
      meaning: "README '현재 진행 단계'의 완료 항목(공개 Challenge 초안, Evaluation Framework, 독립 실행 Pipeline, Leaderboard MVP)과 '향후 방향'(과학 Task·모델 범위 확장, multi-agent benchmark, AutoResearch 기반 Autonomous Research Agent)." },
    { name: "SEARCH → RESEARCH", from: 13.0, to: 15.5,
      screen: "점이 화면을 덮어 어두워지고 SEARCH.가 나타난다. 앞에 녹색 RE가 끼어들어 RESEARCH.가 된다. 캡션 \"Next: from agents that search to agents that research.\"(다음 목표: 검색하는 에이전트에서 연구하는 에이전트로)",
      meaning: "향후 방향으로 적어둔 AutoResearch 개념 기반 Autonomous Research Agent. '고려 중'인 방향이라 캡션에 Next를 붙였다." },
    { name: "엔드카드", from: 15.5, to: 17.6,
      screen: "점이 가짜연구소 로고 가운데로 들어가고 로고가 펼쳐지며 브랜드 사운드가 착지한다. 제목 Science Agent *Leaderboard*, Pseudo Lab, Season 13(13기), Link in post ↓(링크는 본문에).",
      meaning: "프로젝트 이름, 주최, 기수와 본문 링크 안내." },
    { name: "루프 복귀", from: 17.6, to: 18.6,
      screen: "로고가 접히고 화면이 밝아지며, 점이 실행 카드의 상태 표시등 자리로 돌아간다. Run 버튼과 커서도 제자리로.",
      meaning: "다음 실행(run)이 다시 시작되는 것처럼 영상이 처음으로 이어진다." },
  ],
  wordplays: [
    {
      scene: "오프닝", at: at(3.3), from: "VALID", to: "INVALID",
      how: "VALID.는 그대로 오른쪽으로 밀리고, 앞에 녹색 I·N이 튀어 들어와 INVALID.가 된다. 마침표(녹색 점)는 단어 끝을 따라간다.",
      words: [
        { word: "valid", reading: "밸리드", meaning: "유효한, 인정되는" },
        { word: "invalid", reading: "인밸리드", meaning: "무효인, 인정되지 않는" },
        { word: "exit code 0", reading: "엑싯 코드 제로", meaning: "프로그램이 오류 없이 끝났다는 신호. 보통 '성공'으로 읽힌다" },
      ],
      meaning: "두 글자를 넣었을 뿐인데 '유효'가 '무효'가 된다. 프로그램은 성공으로 끝났지만(exit 0) 공식 지표가 없으니 결과로 인정되지 않는다.",
      why: "README에 적힌 실제 문제: 종료 코드 0을 반환해도 최종 지표가 생성되지 않은 실행이 성공으로 집계될 수 있었고, 지금은 지표가 없거나 유효하지 않으면 실패로 처리한다.",
    },
    {
      scene: "평가 기준", at: at(8.9), from: "EVALUATE", to: "VALUE",
      how: "EVALUATE의 첫 E, 가운데 A·T가 떨어지고 V·A·L·U·E가 모여 VALUE가 된다.",
      words: [
        { word: "evaluate", reading: "이밸류에이트", meaning: "평가하다" },
        { word: "value", reading: "밸류", meaning: "가치" },
      ],
      meaning: "EVALUATE 안에 이미 VALUE가 들어 있다. 평가란 결국 무엇이 가치 있는지 가려내는 일. 캡션 \"Not just the answer. The design behind it.\" = '정답만이 아니라, 그 뒤의 설계까지'.",
      why: "이 프로젝트는 정답률 하나가 아니라 Workflow·Tool usage·Cost·Reproducibility, 즉 Agent 설계의 가치를 평가한다.",
      note: "e-VALU-a-t-E: 철자 순서를 바꾸지 않고 빼기만으로 VALUE가 나온다.",
    },
    {
      scene: "SEARCH → RESEARCH", at: at(14.6), from: "SEARCH", to: "RESEARCH",
      how: "SEARCH.가 오른쪽으로 밀리고 앞에 녹색 R·E가 들어와 RESEARCH.가 된다.",
      words: [
        { word: "search", reading: "서치", meaning: "찾다, 검색" },
        { word: "research", reading: "리서치", meaning: "연구. 어원상 re-(다시) + search(찾다), 거듭 찾아 파고든다는 뜻" },
        { word: "AutoResearch", reading: "오토리서치", meaning: "Andrej Karpathy가 제시한, 에이전트가 스스로 연구를 수행하는 개념" },
      ],
      meaning: "검색(SEARCH)에 RE를 붙이면 연구(RESEARCH)가 된다. 답을 찾아오는 에이전트에서 스스로 연구하는 에이전트로 가자는 방향.",
      why: "README '향후 방향': AutoResearch 개념을 기반으로 한 Autonomous Research Agent 구조 적용을 고려하고 있다.",
      note: "아직 '고려 중'인 계획이므로 영상 캡션에 Next를 붙였고, 포스트에서도 목표로 표현한다.",
    },
  ],
  glossary: [
    {
      scene: "관문 여섯 개",
      summary: "점이 지나가는 여섯 단계는 README '공개 실행 파이프라인'을 줄인 것이다. 하나라도 통과하지 못한 실행은 보드에 오르지 않는다.",
      terms: [
        { term: "Isolate the run", reading: "아이솔레이트 더 런", meaning: "실행마다 별도 작업 공간과 실행 ID를 쓰고, 이전 실행의 대화·세션 상태를 재사용하지 않는다", where: "관문 2" },
        { term: "Validate the schema", reading: "밸리데이트 더 스키마", meaning: "에이전트가 낸 산출물이 정해진 형식(스키마)을 지켰는지 검사", where: "관문 4" },
        { term: "Check the metric", reading: "체크 더 메트릭", meaning: "공식 지표가 실제로 생성되고 유효한지 확인. 없으면 실패", where: "관문 5" },
      ],
    },
    {
      scene: "평가 기준",
      summary: "칩 네 개는 README '우리가 평가하는 것'의 주요 평가 요소다.",
      terms: [
        { term: "Correctness", reading: "커렉트니스", meaning: "정답 정확도", where: "칩" },
        { term: "Tool use", reading: "툴 유즈", meaning: "도구 활용", where: "칩" },
        { term: "Cost", reading: "코스트", meaning: "비용 효율성", where: "칩" },
        { term: "Reproducibility", reading: "리프로듀서빌리티", meaning: "재현성: 같은 조건에서 다시 돌려도 같은 결과가 나오는가", where: "칩" },
        { term: "MVP", reading: "엠브이피", meaning: "Minimum Viable Product, 핵심 기능만 갖춘 첫 버전", where: "Built so far" },
      ],
    },
  ],
  stills: {
    card: at(0.15),
    valid: at(2.255),
    invalid: at(3.805),
    pipeline: at(7.005),
    evaluate: at(8.155),
    value: at(9.405),
    progress: at(12.955),
    research: at(15.105),
    "end-card": at(17.205),
  },
  music: {
    hit: at(15.5),
    events: { pipeline: at(4.6), dark: at(13.48) },
    sting: { file: "music/brand-sting.wav" },
  },
};
export default project;
