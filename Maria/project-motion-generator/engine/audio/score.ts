// 두 개의 트랙을 작곡: bed(90초 배경곡)와 sting(엔딩 사운드 로고)
import { BEAT, BAR, PROGRESSION, MOTIF, LANDING, hz } from "./theory";
import { pluck, pad, bass, kick, hat, noiseBuffer, reverbIR, type Bus } from "./instruments";

export const BED_BARS = 36;                 // 36마디 = 86.4초
export const BED_SECONDS = BED_BARS * BAR + 3.6; // + 잔향 꼬리 = 90초
/** 사운드 로고: 착지(D6)가 STING_PREROLL초 뒤에 옴. 영상에서는 이 착지를 엔드카드 로고 등장에 맞춤 */
export const STING_PREROLL = BEAT * 1.5;   // 0.9초 (8분음표 3개)
export const STING_SECONDS = STING_PREROLL + 7.0;

/** 구간 (마디 단위). 어느 마디에서 잘라도 어색하지 않게 8마디씩 레이어를 쌓았다 뺌 */
export const SECTIONS = [
  { name: "intro", from: 0, to: 4 },   // 모티프 + 패드
  { name: "A", from: 4, to: 12 },      // + 베이스
  { name: "B", from: 12, to: 20 },     // + 아르페지오 + 킥
  { name: "C", from: 20, to: 28 },     // + 하이햇 (가장 풍성)
  { name: "A2", from: 28, to: 36 },    // 다시 가볍게 → 엔딩으로 넘기기 쉬움
] as const;
const sectionOf = (bar: number) => SECTIONS.find((s) => bar >= s.from && bar < s.to)!.name;

function makeBus(ctx: BaseAudioContext, master: AudioNode): Bus {
  const dry = ctx.createGain();
  const conv = ctx.createConvolver(); conv.buffer = reverbIR(ctx, 3.2, 17);
  const wet = ctx.createGain(); wet.gain.value = 0.55;
  dry.connect(master); wet.connect(conv); conv.connect(master);
  return { dry, wet };
}
function makeMaster(ctx: BaseAudioContext): AudioNode {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.ratio.value = 2.5; comp.attack.value = 0.01; comp.release.value = 0.25;
  const out = ctx.createGain(); out.gain.value = 0.9;
  comp.connect(out); out.connect(ctx.destination);
  return comp;
}

/** 같은 입력 → 같은 결과를 주는 의사 난수 (벨로시티 흔들림용) */
const jitter = (i: number) => (Math.sin(i * 12.9898) * 43758.5453) % 1;

export function scoreBed(ctx: BaseAudioContext): void {
  const bus = makeBus(ctx, makeMaster(ctx));
  const noise = noiseBuffer(ctx, 2, 5);
  for (let bar = 0; bar < BED_BARS; bar++) {
    const t0 = bar * BAR;
    const ch = PROGRESSION[bar % 4];
    const sec = sectionOf(bar);
    const last = bar === BED_BARS - 1;

    // 패드: 항상
    pad(ctx, bus, t0, BAR, ch.pad.map(hz), sec === "C" ? 0.2 : 0.17, sec === "intro" ? 800 : 1100);

    // 모티프 (녹색 점): 2마디마다 첫 박에 D5-F#5-A5. 착지음 D6은 배경곡에서 절대 안 씀
    if (bar % 2 === 0) MOTIF.forEach((n, i) => pluck(ctx, bus, t0 + i * BEAT * 0.5, hz(n), 0.42 - i * 0.04, -0.2 + i * 0.2, 0.45));

    // 베이스: 1박, 3박 반
    if (sec !== "intro") {
      bass(ctx, bus, t0, BEAT * 2.3, hz(ch.bass), 0.17);
      bass(ctx, bus, t0 + BEAT * 2.5, BEAT * 1.4, hz(ch.bass), 0.12);
    }
    // 아르페지오: 8분음표, 모티프가 있는 마디에선 앞 두 박을 비움
    if (sec === "B" || sec === "C" || sec === "A2") {
      ch.arp.forEach((n, i) => {
        if (bar % 2 === 0 && i < 4) return;
        if (last && i >= 6) return;
        const v = (sec === "A2" ? 0.16 : 0.2) + jitter(bar * 8 + i) * 0.03;
        pluck(ctx, bus, t0 + i * BEAT * 0.5, hz(n), v, i % 2 ? 0.35 : -0.35, 0.3, 0.7);
      });
    }
    // 킥: 1, 3박
    if (sec === "B" || sec === "C") for (const b of [0, 2]) kick(ctx, bus, t0 + b * BEAT, 0.32);
    // 하이햇: 엇박 8분
    if (sec === "C") for (let i = 0; i < 4; i++) hat(ctx, bus, noise, t0 + (i + 0.5) * BEAT, 0.06 + jitter(bar * 4 + i) * 0.02, 0.4);
  }
}

/**
 * 엔딩 사운드 로고. 모든 시즌 영상이 이 소리로 끝남.
 * D5-F#5-A5 (배경곡에서 계속 반복되던 미완성 모티프) → D6 착지 + Dmaj9 화음 + 서브 베이스.
 * 배경곡은 한 번도 D6에 착지하지 않으므로, 이 순간이 "해결"로 들림.
 */
export interface StingOptions {
  /** D 기준 반음 이동 (F장조 곡이면 +3, G장조면 +5) */
  semitones?: number;
  /** 프리롤 3음의 템포. 곡의 BPM에 맞추면 곡에서 sting으로 자연스럽게 이어짐 */
  bpm?: number;
}
export const stingPreroll = (bpm = 100) => (60 / bpm) * 1.5;

export function scoreSting(ctx: BaseAudioContext, { semitones = 0, bpm = 100 }: StingOptions = {}): void {
  const bus = makeBus(ctx, makeMaster(ctx));
  const k = Math.pow(2, semitones / 12);
  const f = (n: string) => hz(n) * k;
  const beat = 60 / bpm;
  const hit = stingPreroll(bpm);
  MOTIF.forEach((n, i) => pluck(ctx, bus, i * beat * 0.5, f(n), 0.34, -0.25 + i * 0.25, 0.45));
  pluck(ctx, bus, hit, f(LANDING), 0.5, 0, 0.6, 3.2);
  pluck(ctx, bus, hit, f("D5"), 0.22, -0.1, 0.6, 2.6);
  pluck(ctx, bus, hit + beat * 0.5, f("A5"), 0.12, 0.3, 0.7, 2.0);
  pluck(ctx, bus, hit + beat, f("E6"), 0.1, -0.3, 0.8, 2.4);   // maj9의 9음: 열린 끝맺음
  pad(ctx, bus, hit, 2.6, ["D3", "F#3", "A3", "C#4", "E4"].map(f), 0.22, 1400);
  bass(ctx, bus, hit, 2.8, f("D2"), 0.22);
  kick(ctx, bus, hit, 0.35);
}
