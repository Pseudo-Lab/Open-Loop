import type { Project } from "../../engine/project";
import { measure, render, COPY } from "./film";
import { timeline } from "./timeline";

const at = (t: number) => timeline.unwarp("film", t);

const project: Project = {
  id: "openloop",
  title: "OpenLoop",
  copy: [
    COPY.label, COPY.global, COPY.whyLabel, COPY.rel, COPY.openrel, COPY.relCap, COPY.loopHead, ...COPY.steps, ...COPY.motto,
    COPY.msHead, COPY.msSub, ...COPY.milestones, "01020304", COPY.msFoot, ...COPY.words, COPY.pool, COPY.poolCap,
    COPY.title, COPY.chip, COPY.info, COPY.cta,
  ],
  italicCopy: [COPY.titleItalic],
  timeline,
  init: measure,
  draw: (ctx, fr) => render(ctx, fr.t),
  scenes: [
    { name: "오프닝: LOCAL ONLY 끄기", from: 0, to: 2.9,
      screen: "설정 화면 같은 카드에 LOCAL ONLY(국내 전용) 토글이 켜져 있고, 토글 손잡이가 녹색 점이다. 커서가 토글을 끄면 손잡이가 튀어나가고, ONLY가 떨어지며 LOCAL이 GLOBAL(글로벌)로 바뀐다. 점은 GLOBAL 뒤의 마침표 자리에 앉는다.",
      meaning: "한국에서 만들어진 가짜연구소 프로젝트를 '국내 전용'에서 꺼내 글로벌 독자에게 보여주자는 OpenLoop의 출발점." },
    { name: "Why: OpenRel", from: 2.9, to: 6.0,
      screen: "\"Why OpenLoop?\" 아래 OPEN SOURCE RELATIONS가 나타나고, 글자들이 빠지며 OPENREL만 남는다. 아래 \"Open source relations: more than translation.\"(오픈소스 관계: 번역 그 이상)",
      meaning: "README의 'OpenRel = Open Source Relations'. 단순 번역이 아니라, 프로젝트와 글로벌 기여자 사이의 관계를 만드는 일이라는 것." },
    { name: "여섯 단계 루프", from: 6.0, to: 10.5,
      screen: "\"One loop, six steps.\"(하나의 루프, 여섯 단계) 아래 원형 링. 점이 Translate(번역) → Post(포스트) → Visual(비주얼) → Review(검토) → Publish(발행) → Contribute(기여)를 시계 방향으로 돌고, 한 바퀴를 마치면 링 안에 \"Build manually. Standardize what works. Automate with purpose.\"(직접 만들고, 잘 되는 것을 표준화하고, 목적이 있을 때 자동화한다)",
      meaning: "README의 OpenLoop 워크플로우(블로그 번역 → 링크드인 포스트 → 비주얼 → QA·사람 검토 → 발행 → GitHub 기여 ↻)를 한 바퀴의 루프로 보여준다. 기여가 다시 다음 이야기로 이어지는 순환." },
    { name: "15주 마일스톤", from: 10.5, to: 13.0,
      screen: "15 weeks, 매주 월요일, 2026년 10월 ~ 2027년 1월. 점이 01 BUILD → 02 CURATE → 03 DEVELOP → 04 SCALE을 차례로 뛴다. 아래 \"Goal: a reusable OpenLoop Toolkit\"(목표: 다시 쓸 수 있는 OpenLoop 툴킷)",
      meaning: "README의 네 마일스톤(루프 만들기 → 다듬기 → 개발 → 확장)과 시즌 결과물." },
    { name: "평가 기준 궤도 → POOL", from: 13.0, to: 15.7,
      screen: "점이 화면을 덮어 어두워지고 ACCURACY · CONSISTENCY · REUSABILITY · HUMAN REVIEW · LOOP가 점 주위를 돈다. LOOP만 남아 펴지고, 글자 순서가 뒤집혀 POOL이 된다. 점이 밑줄을 그으며 \"A loop that grows a contributor pool.\"(기여자 풀을 키우는 루프)",
      meaning: "워크플로우를 평가하는 기준들 가운데 루프가 중심. 루프를 돌수록 프로젝트에 관심 갖는 기여자 풀이 커지길 바라는 목표." },
    { name: "엔드카드", from: 15.7, to: 17.7,
      screen: "밑줄이 가짜연구소 로고의 대각선이 되고 로고가 펼쳐지며 엔딩 사운드가 착지. 제목 Open*Loop*, Pseudo Lab, 15 weeks · Season 13, Link in post ↓(링크는 본문에).",
      meaning: "프로젝트 이름, 주최, 기간과 본문 링크 안내." },
    { name: "루프 복귀", from: 17.7, to: 18.8,
      screen: "로고가 점으로 접히고 화면이 밝아지며, 점이 LOCAL ONLY 토글의 손잡이 자리로 돌아가 토글이 다시 켜진다.",
      meaning: "영상 자체가 처음으로 돌아가는 루프. OpenLoop라는 이름 그대로 끊김 없이 반복된다." },
  ],
  wordplays: [
    {
      scene: "오프닝", at: at(1.95), from: "LOCAL ONLY", to: "GLOBAL",
      how: "토글을 끄면 ONLY와 C가 떨어지고, L·O·A·L은 남아 커지며, 녹색 G와 B가 끼어든다.",
      words: [
        { word: "local only", reading: "로컬 온리", meaning: "국내 전용, 지역에만 한정된" },
        { word: "global", reading: "글로벌", meaning: "전 세계의, 세계적인" },
      ],
      meaning: "'국내 전용' 설정을 끄자 같은 글자들 대부분이 남은 채 '글로벌'이 된다. 프로젝트는 그대로, 닿는 범위만 넓어진다는 뜻.",
      why: "OpenLoop는 한국 커뮤니티의 프로젝트를 영어 콘텐츠로 글로벌 독자에게 소개하는 프로젝트.",
      note: "LOCAL과 GLOBAL은 L-O-?-A-L 뼈대를 공유한다. C를 B로 바꾸고 앞에 G만 붙이면 된다.",
    },
    {
      scene: "Why", at: at(5.0), from: "OPEN SOURCE RELATIONS", to: "OPENREL",
      how: "세 단어 가운데 OPEN과 RELATIONS의 앞 세 글자 REL만 남고 나머지는 떨어져 나가 OPENREL로 붙는다.",
      words: [
        { word: "open source", reading: "오픈 소스", meaning: "누구나 보고 고치고 기여할 수 있게 공개한 소프트웨어나 자료" },
        { word: "relations", reading: "릴레이션스", meaning: "관계. PR(Public Relations, 홍보)처럼 '대외 관계'라는 뜻도 있다" },
        { word: "OpenRel", reading: "오픈렐", meaning: "OpenLoop README에서 쓰는 말: Open Source Relations의 줄임" },
      ],
      meaning: "글자를 덜어내자 팀이 직접 정의한 단어 OpenRel이 드러난다. 아래 캡션 \"more than translation\" = '번역 그 이상'.",
      why: "README의 'Why OpenLoop?'에서 OpenRel = Open Source Relations라고 정의하고, 글로벌 독자에게 닿으려면 번역 이상(맥락 이해, 정확성, 기여로 이어지는 길)이 필요하다고 설명한다.",
    },
    {
      scene: "평가 기준 궤도", at: at(15.3), from: "LOOP", to: "POOL",
      how: "가운데 O·O는 그대로 두고, 양 끝의 L과 P가 위아래로 돌아 자리를 맞바꾼다. 그래서 LOOP를 거꾸로 읽은 POOL이 된다.",
      words: [
        { word: "loop", reading: "루프", meaning: "고리, 순환. 끝이 다시 처음으로 이어지는 흐름" },
        { word: "pool", reading: "풀", meaning: "모여 있는 사람이나 자원의 집합. contributor pool = 기여자 풀" },
      ],
      meaning: "LOOP를 거꾸로 읽으면 POOL. 루프를 계속 돌리면 기여자 풀이 생긴다는 뜻. 캡션 \"A loop that grows a contributor pool.\" = '기여자 풀을 키우는 루프'.",
      why: "OpenLoop의 목표는 글로벌 독자가 GitHub로 들어와 기여할 수 있는 길을 만드는 것. 워크플로우의 마지막 단계(Contribute)가 다음 루프로 이어진다.",
      note: "이것은 목표를 표현한 문구다. 실제로 기여자가 늘었다는 성과를 주장하지 않도록 포스트에서도 '목표'로 표현한다.",
    },
  ],
  glossary: [
    {
      scene: "평가 기준 궤도",
      summary: "점 주위를 도는 단어들은 README의 'Workflow Evaluation'(워크플로우 평가 기준)에서 가져왔다. 결과물을 어떤 기준으로 평가하는지를 보여주고, 그 가운데 LOOP만 남는다.",
      terms: [
        { term: "ACCURACY", reading: "애큐러시 (정확성)", meaning: "원본 사실과 기술적 의미를 그대로 지켰는가", where: "평가 기준" },
        { term: "CONSISTENCY", reading: "컨시스턴시 (일관성)", meaning: "표준화된 OpenLoop 형식을 따르는가", where: "평가 기준" },
        { term: "REUSABILITY", reading: "리유저빌리티 (재사용성)", meaning: "다른 프로젝트에도 다시 만들지 않고 적용할 수 있는가", where: "평가 기준" },
        { term: "HUMAN REVIEW", reading: "휴먼 리뷰 (사람 검토)", meaning: "AI가 만든 결과를 사람이 확인하는 단계. README의 Human Intervention(사람 개입 정도) 기준과 QA & Human Review 단계", where: "평가 기준 · 워크플로우" },
        { term: "LOOP", reading: "루프", meaning: "번역에서 기여까지 이어지고 다시 처음으로 돌아가는 워크플로우 전체", where: "프로젝트 이름" },
      ],
    },
  ],
  stills: {
    toggle: at(0.2),
    global: at(1.955),
    openrel: at(5.005),
    loop: at(10.005),
    milestones: at(12.935),
    pool: at(15.5),
    "end-card": at(17.205),
  },
  music: { hit: at(15.7), events: { why: at(3.1), loop: at(6.6), dark: at(13.48) } },
};
export default project;
