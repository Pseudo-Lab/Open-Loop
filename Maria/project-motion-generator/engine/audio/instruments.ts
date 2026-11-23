// Web Audio 악기들. 모두 (ctx, 출력, 시각, ...)으로 노드를 예약만 함 → OfflineAudioContext에서 결정적으로 렌더
type Ctx = BaseAudioContext;

export interface Bus { dry: AudioNode; wet: AudioNode }

function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}
function osc(ctx: Ctx, type: OscillatorType, freq: number, t: number, stop: number, detune = 0) {
  const o = ctx.createOscillator();
  o.type = type; o.frequency.value = freq; o.detune.value = detune;
  o.start(t); o.stop(stop);
  return o;
}
function pan(ctx: Ctx, p: number, to: AudioNode) {
  const s = ctx.createStereoPanner(); s.pan.value = p; s.connect(to); return s;
}
function send(ctx: Ctx, from: AudioNode, bus: Bus, wet: number) {
  from.connect(bus.dry);
  const w = ctx.createGain(); w.gain.value = wet; from.connect(w); w.connect(bus.wet);
}

/** 마림바 계열 플럭: 녹색 점의 소리. 기음 + 4배음(마림바 특유의 나무 울림) */
export function pluck(ctx: Ctx, bus: Bus, t: number, freq: number, vel: number, p = 0, wet = 0.35, decay = 1.3) {
  const out = ctx.createGain();
  const pn = ctx.createStereoPanner(); pn.pan.value = p;
  out.connect(pn); send(ctx, pn, bus, wet);
  const g1 = ctx.createGain(); env(g1, t, vel, 0.004, decay);
  osc(ctx, "sine", freq, t, t + decay + 0.1).connect(g1); g1.connect(out);
  const g2 = ctx.createGain(); env(g2, t, vel * 0.22, 0.002, 0.18);
  osc(ctx, "sine", freq * 3.98, t, t + 0.3).connect(g2); g2.connect(out);
  const g3 = ctx.createGain(); env(g3, t, vel * 0.08, 0.001, 0.05);
  osc(ctx, "triangle", freq * 9.1, t, t + 0.1).connect(g3); g3.connect(out);
}

/** 패드: 살짝 디튠된 톱니파 3개 → 로우패스. 느린 어택으로 배경을 채움 */
export function pad(ctx: Ctx, bus: Bus, t: number, dur: number, freqs: number[], vel: number, cutoff = 900) {
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; lp.Q.value = 0.4;
  const g = ctx.createGain();
  const att = Math.min(0.9, dur * 0.4), rel = 1.2;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vel, t + att);
  g.gain.setValueAtTime(vel, t + dur);
  g.gain.linearRampToValueAtTime(0, t + dur + rel);
  lp.connect(g); send(ctx, g, bus, 0.5);
  freqs.forEach((f, i) => {
    for (const d of [-7, 0, 7]) {
      const o = osc(ctx, "sawtooth", f, t, t + dur + rel + 0.05, d + (i % 2 ? 3 : -3));
      const pg = ctx.createGain(); pg.gain.value = 1 / (freqs.length * 3);
      const pn = ctx.createStereoPanner(); pn.pan.value = d / 14;
      o.connect(pg); pg.connect(pn); pn.connect(lp);
    }
  });
}

/** 베이스: 사인 + 약한 삼각파, 로우패스로 둥글게 */
export function bass(ctx: Ctx, bus: Bus, t: number, dur: number, freq: number, vel: number) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vel, t + 0.015);
  g.gain.exponentialRampToValueAtTime(vel * 0.5, t + dur * 0.7);
  g.gain.linearRampToValueAtTime(0, t + dur);
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 320;
  osc(ctx, "sine", freq, t, t + dur + 0.05).connect(g);
  const tg = ctx.createGain(); tg.gain.value = 0.25;
  osc(ctx, "triangle", freq * 2, t, t + dur + 0.05).connect(tg); tg.connect(g);
  g.connect(lp); lp.connect(bus.dry);
}

/** 부드러운 킥: 사인 피치 드롭 */
export function kick(ctx: Ctx, bus: Bus, t: number, vel: number) {
  const o = osc(ctx, "sine", 110, t, t + 0.5);
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
  const g = ctx.createGain(); env(g, t, vel, 0.002, 0.38);
  o.connect(g); g.connect(bus.dry);
}

/** 노이즈 버퍼 (시드 고정 → 매번 같은 소리) */
export function noiseBuffer(ctx: Ctx, seconds: number, seed: number): AudioBuffer {
  const b = ctx.createBuffer(2, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  let a = seed;
  const rnd = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1; }
  return b;
}

/** 하이햇: 고정 노이즈 → 하이패스 */
export function hat(ctx: Ctx, bus: Bus, noise: AudioBuffer, t: number, vel: number, p: number) {
  const s = ctx.createBufferSource(); s.buffer = noise;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7500;
  const g = ctx.createGain(); env(g, t, vel, 0.001, 0.06);
  s.connect(hp); hp.connect(g); g.connect(pan(ctx, p, bus.dry));
  s.start(t, (t * 7.3) % 1.5, 0.12);
}

/** 리버브용 임펄스 응답: 지수 감쇠 스테레오 노이즈 */
export function reverbIR(ctx: Ctx, seconds: number, seed: number): AudioBuffer {
  const b = noiseBuffer(ctx, seconds, seed);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < d.length; i++) d[i] *= Math.pow(1 - i / d.length, 3.2);
  }
  return b;
}
