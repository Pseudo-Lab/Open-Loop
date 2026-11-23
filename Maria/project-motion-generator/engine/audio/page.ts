// 헤드리스 브라우저에서 OfflineAudioContext로 렌더 → 16bit WAV(base64)
import { scoreBed, scoreSting, BED_SECONDS, STING_SECONDS, stingPreroll, type StingOptions } from "./score";

const RATE = 48000;

function wav(buf: AudioBuffer, gain: number): Uint8Array {
  const n = buf.length, ch = 2, out = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const w = (o: number, s: string) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); out.setUint32(4, 36 + n * ch * 2, true); w(8, "WAVEfmt ");
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, RATE, true); out.setUint32(28, RATE * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true);
  w(36, "data"); out.setUint32(40, n * ch * 2, true);
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  for (let i = 0; i < n; i++) {
    out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i] * gain)) * 32767, true);
    out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i] * gain)) * 32767, true);
  }
  return new Uint8Array(out.buffer);
}
function b64(u: Uint8Array): string {
  let s = "";
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
}

declare global { interface Window { renderTrack: (k: "bed" | "sting", peakDb: number, opts?: StingOptions) => Promise<{ wav: string; peak: number }> } }

window.renderTrack = async (kind, peakDb, opts = {}) => {
  const secs = kind === "bed" ? BED_SECONDS : STING_SECONDS - stingPreroll() + stingPreroll(opts.bpm);
  const ctx = new OfflineAudioContext(2, Math.ceil(secs * RATE), RATE);
  if (kind === "bed") scoreBed(ctx); else scoreSting(ctx, opts);
  const buf = await ctx.startRendering();
  let peak = 0;
  for (let c = 0; c < 2; c++) for (const v of buf.getChannelData(c)) peak = Math.max(peak, Math.abs(v));
  const gain = Math.pow(10, peakDb / 20) / peak; // 피크 정규화
  return { wav: b64(wav(buf, gain)), peak };
};
