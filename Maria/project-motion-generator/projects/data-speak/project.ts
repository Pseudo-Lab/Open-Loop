import type { Project } from "../../engine/project";
import { measure, render, COPY } from "./film";
import { timeline } from "./timeline";

const at = (t: number) => timeline.unwarp("film", t);

const project: Project = {
  id: "data-speak",
  title: "Data Still Does Not Speak",
  copy: [
    COPY.hookFrom, COPY.hookTo, COPY.causal, COPY.casual, COPY.caption, `${COPY.axisX} →`, `↑ ${COPY.axisY}`,
    ...COPY.qHead, ...COPY.questions, COPY.qFoot, "01020304", ...COPY.words, COPY.quest, COPY.questCap,
    ...COPY.title, COPY.chip, COPY.info, COPY.cta,
  ],
  italicCopy: [COPY.titleItalic],
  timeline,
  init: measure,
  draw: (ctx, fr) => render(ctx, fr.t),
  scenes: [
    { name: "오프닝: 데이터가 말한다?", from: 0, to: 2.6,
      screen: "Data speaks. 한 문장. 문장 끝 마침표가 녹색 점이다. 단어 사이에 still does not이 끼어들며 Data still does not speak.(데이터는 여전히 말하지 않는다)로 바뀐다.",
      meaning: "데이터만 보면 답이 나온다는 흔한 믿음을 세 단어로 뒤집으며, 프로젝트 이름 그대로 시작한다." },
    { name: "산점도: 그럴듯한 관계", from: 2.6, to: 5.4,
      screen: "마침표가 떨어져 산점도의 점 하나가 된다. 광고비(Ad spend)와 매출(Sales)의 점들이 나타나고 오른쪽 위로 향하는 추세선이 그어진다. 아래에 CAUSAL이 나타났다가 U와 S가 자리를 바꿔 CASUAL이 되고, \"Most data stories are casual, not causal.\"이 뜬다.",
      meaning: "광고비가 늘수록 매출도 느는 것처럼 보이는 그래프(상관)만으로 광고가 매출을 올렸다(인과)고 말하면 대충한 주장이라는 것. 관찰과 인과 주장을 구분하는 것이 이 프로젝트의 첫 번째 학습 목표다. 그래프 데이터는 설명용 예시." },
    { name: "네 가지 질문", from: 5.4, to: 8.3,
      screen: "점들이 녹색 점 하나로 모이고, \"Four questions, every week.\" 아래로 점이 질문 네 개를 하나씩 짚으며 내려간다: 무엇을 관찰했나 · 무엇이 결과를 만들었고 무엇이 빠졌나 · 어디까지 주장할 수 있나 · 다음에 무엇을 확인할까. 아래에 \"14 weeks · reading Behavioral Data Analysis\"(14주 · 『행동 데이터 분석』 함께 읽기).",
      meaning: "프로젝트가 매주 하나의 분석 결과 앞에서 반복하는 네 가지 질문 그대로다. 점이 하나씩 짚는 동작이 질문을 차례로 던지는 과정을 보여준다." },
    { name: "키워드 궤도", from: 8.3, to: 10.2,
      screen: "점이 커져 화면을 덮으며 어두운 화면으로 바뀌고, 점 주위를 CONFOUNDING · BOOTSTRAP · EXPERIMENTS · DAGS · QUESTIONS가 돈다.",
      meaning: "데이터 하나를 여러 방법으로 들여다본다는 것. 14주 동안 배우는 인과추론 방법들이다 (아래 키워드 해설 참고)." },
    { name: "QUESTIONS → QUEST", from: 10.2, to: 10.95,
      screen: "다른 키워드는 바깥으로 날아가고 QUESTIONS만 가운데 펴진다. 뒤의 IONS가 떨어져 QUEST(탐험)만 녹색으로 남고, 점이 그 아래 밑줄을 그으며 \"Every question starts a quest.\"가 뜬다.",
      meaning: "방법은 바뀌어도 중심은 질문이다. 질문을 던지는 14주 자체가 답을 찾아 나서는 탐험이라는 뜻." },
    { name: "엔드카드", from: 10.95, to: 12.95,
      screen: "밑줄이 가짜연구소 로고의 대각선으로 옮겨가고 로고가 펼쳐지며 점이 별 가운데 앉는다. 이때 엔딩 사운드가 착지한다. 제목 Data Still Does Not Speak, Pseudo Lab, 14 weeks · Causal Inference Team(14주 · 인과추론팀), Link in post ↓(링크는 본문에).",
      meaning: "누가(가짜연구소 인과추론팀), 무엇을(데이터는 여전히 말하지 않는다), 얼마나(14주) 하는지 정리하고 본문 링크로 안내한다." },
    { name: "루프 복귀", from: 12.95, to: 14,
      screen: "로고가 점으로 접히고 화면이 다시 밝아지며, 점이 첫 문장 Data speaks.의 마침표 자리로 돌아간다.",
      meaning: "마지막 프레임이 첫 프레임과 같아서 피드에서 반복 재생돼도 끊기지 않는다." },
  ],
  wordplays: [
    {
      scene: "오프닝", at: at(1.8),
      from: "Data speaks.", to: "Data still does not speak.",
      how: "두 단어 사이에 still does not 세 단어가 끼어들고, speaks의 마지막 s가 떨어져 나간다. 문장 끝 마침표가 녹색 점이다.",
      words: [
        { word: "Data speaks", reading: "데이터 스픽스", meaning: "데이터가 말한다. 데이터 업계에서 자주 쓰는 표현 \"Let the data speak(데이터가 말하게 하라)\"에서 온 말로, 숫자만 보면 진실이 저절로 드러난다는 믿음을 담고 있다." },
        { word: "still", reading: "스틸", meaning: "여전히, 아직도" },
        { word: "does not speak", reading: "더즈 낫 스픽", meaning: "말하지 않는다. does not 뒤에는 동사가 기본형이 되어야 해서 speaks → speak로 s가 빠진다 (문법 규칙이 그대로 애니메이션이 됨)." },
      ],
      meaning: "\"데이터가 말한다\"는 익숙한 믿음에 세 단어만 끼워 넣어 \"데이터는 여전히 말하지 않는다\"로 정반대가 된다.",
      why: "프로젝트 이름(「데이터는 여전히 말하지 않는다」)이 그대로 첫 장면이 된다. AI가 분석까지 해주는 시대에도 무엇을 묻고 어떻게 판단할지는 사람의 몫이라는 프로젝트의 출발점.",
    },
    {
      scene: "산점도", at: at(5.2),
      from: "CAUSAL", to: "CASUAL",
      how: "여섯 글자 중 가운데 U와 S가 위아래로 엇갈리며 자리를 바꾼다. 바뀐 두 글자만 녹색이 된다.",
      words: [
        { word: "causal", reading: "코절", meaning: "인과의, 원인과 결과 관계인. causal inference = 인과추론 (이 팀의 이름)." },
        { word: "casual", reading: "캐주얼", meaning: "가벼운, 대충의, 격식 없는. 캐주얼 복장의 그 캐주얼." },
      ],
      meaning: "철자가 거의 같은 두 단어가 글자 두 개 차이로 \"인과적인\"과 \"대충한\"으로 갈린다. 화면 위 추세선은 광고비가 늘면 매출이 늘어 보이게 하지만, 이것만으로 광고가 매출의 원인이라고 말하면 causal이 아니라 casual한 주장이 된다. 아래 문장 \"Most data stories are casual, not causal.\" = \"대부분의 데이터 이야기는 인과가 아니라 대충의 이야기다.\"",
      why: "관찰한 차이를 원인이나 효과라고 말해도 되는지 따지는 것이 이 프로젝트의 학습 목표. 상관(그래프)과 인과(주장)를 구분하자는 메시지를 한 단어로 보여준다.",
      note: "영어권에서도 causal을 casual로 잘못 쓰는 오타가 흔해서, 데이터 분석가들 사이에서 자주 쓰이는 농담이다.",
    },
    {
      scene: "키워드 궤도", at: at(10.55),
      from: "QUESTIONS", to: "QUEST",
      how: "점 주위를 돌던 키워드 중 QUESTIONS만 남아 일자로 펴지고, 뒤의 IONS가 떨어져 나가 QUEST만 녹색으로 남는다. 그 아래에 \"Every question starts a quest.\"",
      words: [
        { word: "questions", reading: "퀘스천스", meaning: "질문들" },
        { word: "quest", reading: "퀘스트", meaning: "탐험, 모험, 무언가를 찾아 나서는 여정. 게임의 \"퀘스트\"와 같은 말." },
      ],
      meaning: "\"질문(question)\" 안에 이미 \"탐험(quest)\"이 들어 있다. \"Every question starts a quest.\" = \"모든 질문은 하나의 탐험을 시작한다.\"",
      why: "이 프로젝트는 매주 네 가지 질문을 반복하는 14주의 여정. 질문을 던지는 일 자체가 답을 찾아 나서는 탐험이라는 뜻을 담았다.",
      note: "우연이 아니라 어원이 같다. 두 단어 모두 라틴어 quaerere(찾다, 구하다)에서 왔다.",
    },
  ],
  glossary: [
    {
      scene: "키워드 궤도 (QUEST 직전)",
      summary: "녹색 점(데이터 하나)을 중심으로 이 프로젝트에서 배우는 방법들이 돈다. 하나의 분석 결과를 여러 방법으로 들여다본다는 뜻. 마지막에는 방법들이 모두 바깥으로 날아가고 QUESTIONS만 남는다: 도구는 바뀌어도 매주 던지는 네 가지 질문이 중심이라는 메시지.",
      terms: [
        { term: "CONFOUNDING", reading: "컨파운딩 (교란)", meaning: "원인과 결과 둘 다에 영향을 주는 제3의 요인 때문에 가짜 관계가 생기는 것. 예: 연말에는 광고비도 늘고 매출도 늘어서, 광고 효과가 아닌데도 광고가 매출을 올린 것처럼 보인다. 앞 장면의 산점도가 바로 이 함정일 수 있다.", where: "W05 · Ch5 교란을 통제하고 비교하기" },
        { term: "BOOTSTRAP", reading: "부트스트랩", meaning: "가진 데이터에서 표본을 여러 번 다시 뽑아 결과가 얼마나 흔들리는지 보는 방법. 추정값 하나가 아니라 그 불확실성까지 함께 말하기 위해 쓴다.", where: "W08 · Ch7 부트스트랩과 불확실성" },
        { term: "EXPERIMENTS", reading: "익스페리먼츠 (실험)", meaning: "A/B 테스트처럼 대상을 무작위로 나눠 한쪽에만 처치를 하고 비교하는 것. 교란을 피하고 원인을 확인하는 가장 확실한 방법.", where: "W09–W11 · Ch8–10 실험 설계, 층화·군집 무작위화" },
        { term: "DAGS", reading: "대그스", meaning: "DAG(Directed Acyclic Graph, 방향성 비순환 그래프) = 인과 다이어그램. 변수들 사이의 원인→결과를 화살표로 그린 그림으로, 무엇을 통제해야 하는지 판단하는 데 쓴다.", where: "W03–W04 · Ch3–4 인과관계를 구조로 표현하기" },
        { term: "QUESTIONS", reading: "퀘스천스", meaning: "매주 반복하는 네 가지 질문 (무엇을 관찰했나 · 무엇이 빠졌나 · 어디까지 말할 수 있나 · 다음에 무엇을 확인할까). 이 단어만 남아 QUEST가 된다.", where: "매주 · 모든 챕터" },
      ],
    },
  ],
  stills: {
    hook: at(1.805),
    "causal-casual": at(5.205),
    questions: at(8.065),
    quest: at(10.9),
    "end-card": at(12.205),
  },
  music: { hit: at(10.95), events: { plot: at(2.9), questions: at(5.85), dark: at(8.73) } },
};
export default project;
