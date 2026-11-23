import type { Project } from "../../engine/project";
import { measure, render, renderSeries } from "./film";
import { timeline } from "./timeline";

const at = (t: number) => timeline.unwarp("film", t);

const project: Project = {
  id: "legal-kg",
  title: "Building a Legal Knowledge Graph",
  copy: [
    "Hide Connections", "Connectıons", "ı", "Legalese", "Legal ease", "Act", "Article", "Case", "Term",
    "contains", "cites", "defines", "12 weeks", "Every Wednesday, October to December 2026", "01", "02", "03",
    "Collect", "Build", "Open source", "LAW", "ONTOLOGY", "GRAPH DB", "OPEN SOURCE", "KNOWLEDGE", "EDGE",
    "Building a Legal", "Knowledge Graph", "Pseudo Lab", "12 weeks · Oct–Dec 2026", "Link in post ↓",
    "First in a series", "of knowledge graphs.", "?", "Law", "Open dataset and code, published on GitHub",
  ],
  italicCopy: ["Graph"],
  timeline,
  init: measure,
  draw(ctx, fr) {
    if (fr.scene === "series") renderSeries(ctx, fr.t, fr.video);
    else render(ctx, fr.t);
  },
  scenes: [
    { name: "오프닝: 연결 숨기기 끄기", from: 0, to: 2.5,
      screen: "설정 화면 같은 카드에 Hide Connections(연결 숨기기) 토글. 커서가 토글을 끄면 Hide가 떨어지고 Connections(연결)만 크게 남는다. i 위의 점이 녹색.",
      meaning: "법률 문서 속에 숨어 있던 연결을 드러내는 것이 지식 그래프라는 출발점." },
    { name: "법률 그래프 + Legal ease", from: 2.5, to: 5.5,
      screen: "녹색 점이 튀어나와 중심 노드가 되고 Act(법령) · Article(조문) · Case(판례) · Term(용어) 노드가 contains(포함) · cites(인용) · defines(정의) 선으로 연결된다. 아래 Legalese(어려운 법률 용어)에 a가 끼어들어 Legal ease(법을 쉽게)가 된다.",
      meaning: "법률 문서를 점과 선으로 구조화하면 어려운 법을 쉽게 탐색할 수 있다. 노드·엣지 이름은 온톨로지 확정 전 예시." },
    { name: "지식 그래프 시리즈의 첫 번째", scene: "series", from: 0, to: 3.3,
      screen: "그래프가 점 하나로 모이고, 점 옆으로 ? 노드 네 개가 이어진다. 녹색 점 아래 01 Law, 위에 \"First in a series of knowledge graphs.\"(지식 그래프 시리즈의 첫 번째). ? 노드들이 물결처럼 흔들리고 작은 신호가 흘러간다.",
      meaning: "여러 분야의 지식 그래프를 만들 계획이고 법률이 그 첫 번째. ?는 아직 정해지지 않은 다음 분야." },
    { name: "12주 로드맵", from: 5.5, to: 7.45,
      screen: "12 weeks와 매주 수요일, 2026년 10~12월. 점이 01 Collect(수집) → 02 Build(구축) → 03 Open source(공개)를 차례로 뛴다. 아래 \"Open dataset and code, published on GitHub\"(데이터셋과 코드를 GitHub에 공개).",
      meaning: "프로젝트의 세 마일스톤과 결과물." },
    { name: "키워드 궤도 → EDGE", from: 7.45, to: 10.45,
      screen: "점이 화면을 덮어 어두워지고 LAW · ONTOLOGY · GRAPH DB · OPEN SOURCE · KNOWLEDGE가 점 주위를 돈다. KNOWLEDGE만 남아 KNOWL이 떨어지고 EDGE가 녹색으로 남으며 점이 밑줄을 긋는다.",
      meaning: "지식(knowledge) 안에 그래프의 선(edge)이 있다. 그 선이 다음 장면에서 로고가 된다." },
    { name: "엔드카드", from: 10.45, to: 12.5,
      screen: "밑줄이 로고의 대각선이 되고 로고가 펼쳐지며 엔딩 사운드가 착지. Building a Legal Knowledge Graph, Pseudo Lab, 12 weeks · Oct–Dec 2026, Link in post ↓.",
      meaning: "프로젝트 이름, 주최, 기간, 본문 링크 안내." },
    { name: "루프 복귀", from: 12.5, to: 13.5,
      screen: "로고가 점으로 접히고 화면이 밝아지며 점이 Connections의 i 위로 돌아가고 토글이 다시 켜진다.",
      meaning: "첫 프레임과 같은 화면으로 끝나 반복 재생이 끊기지 않는다." },
  ],
  wordplays: [
    {
      scene: "오프닝", at: at(2.0), from: "Hide Connections", to: "Connections",
      how: "설정 화면의 Hide Connections 토글을 커서가 끄면 Hide가 떨어져 나가고 Connections만 크게 남는다. i 위의 점이 녹색.",
      words: [
        { word: "hide", reading: "하이드", meaning: "숨기다" },
        { word: "connections", reading: "커넥션스", meaning: "연결, 관계들" },
      ],
      meaning: "\"연결 숨기기\" 설정을 끄자 \"연결\"이 드러난다.",
      why: "법률 문서 속에 숨어 있던 법령·조문·판례 사이의 관계를 드러내는 것이 지식 그래프의 역할.",
    },
    {
      scene: "그래프", at: at(5.0), from: "Legalese", to: "Legal ease",
      how: "Legal과 ese 사이가 벌어지고 녹색 a가 끼어든다.",
      words: [
        { word: "legalese", reading: "리걸리즈", meaning: "법률가들만 아는 어렵고 딱딱한 법률 문체. Chinese, Japanese처럼 -ese를 붙여 \"법률 나라 말\"이라고 비꼬는 표현." },
        { word: "legal ease", reading: "리걸 이즈", meaning: "법의 쉬움, 법을 쉽게. ease = 쉬움, 편안함." },
      ],
      meaning: "글자 하나(a)와 띄어쓰기 하나로 \"어려운 법률 용어\"가 \"쉬워진 법\"으로 바뀐다.",
      why: "법률 문서를 그래프로 구조화하면 어려운 법을 탐색하기 쉬워진다는 프로젝트의 가치.",
    },
    {
      scene: "키워드 궤도", at: at(10.1), from: "KNOWLEDGE", to: "EDGE",
      how: "KNOWLEDGE의 앞 다섯 글자 KNOWL이 떨어져 나가고 EDGE만 녹색으로 남은 뒤, 점이 그 아래로 선을 긋는다.",
      words: [
        { word: "knowledge", reading: "날리지", meaning: "지식" },
        { word: "edge", reading: "엣지", meaning: "그래프에서 두 점(노드)을 잇는 선(간선). 일상에서는 가장자리, 경쟁력이라는 뜻도 있다." },
      ],
      meaning: "\"지식\"이라는 단어 끝에 \"그래프의 선\"이 숨어 있다.",
      why: "지식 그래프(Knowledge Graph)는 점(노드)과 선(엣지)으로 지식을 표현한다. 단어 안에서 그 구조를 보여주고, 그 선이 그대로 가짜연구소 로고의 대각선이 된다.",
    },
  ],
  stills: {
    "toggle-click": at(1.0),
    "legal-ease": at(5.2),
    "series": timeline.unwarp("series", 2.05),
    "edge": at(10.25),
    "end-card": at(12.2),
  },
  music: {
    hit: at(10.45),
    offset: 11.85, // 2026-11-01 승인본
    events: { graph: at(2.5), series: timeline.unwarp("series", 0), dark: at(7.98) },
  },
};
export default project;
