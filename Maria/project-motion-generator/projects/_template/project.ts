import type { Project } from "../../engine/project";
import { measure, render, COPY } from "./film";
import { timeline } from "./timeline";

const at = (t: number) => timeline.unwarp("film", t);

const project: Project = {
  id: "_template",
  title: "Template project",
  copy: [COPY.from, COPY.to, ...COPY.title, COPY.chip, COPY.info, COPY.cta],
  timeline,
  init: measure,
  draw: (ctx, fr) => render(ctx, fr.t),
  scenes: [
    { name: "말장난", from: 0, to: 2.6, screen: "화면에서 보이는 것", meaning: "이 장면이 전하는 의미" },
    { name: "엔드카드", from: 2.6, to: 6, screen: "로고, 제목, 칩, CTA", meaning: "누가·무엇을·언제" },
  ],
  wordplays: [
    {
      scene: "말장난", at: at(2.3), from: COPY.from, to: COPY.to,
      how: "화면에서 글자가 어떻게 바뀌는지",
      words: [{ word: "hide", reading: "하이드", meaning: "숨기다" }],
      meaning: "바뀌기 전후로 뜻이 어떻게 뒤집히는지",
      why: "이 프로젝트와 어떻게 연결되는지",
    },
  ],
  stills: { pun: at(1.2), "pun-result": at(2.305), "end-card": at(4.405) },
  music: { hit: at(3.6), events: { pun: at(1.55) } },
};
export default project;
