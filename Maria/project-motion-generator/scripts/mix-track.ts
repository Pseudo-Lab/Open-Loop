/**
 * 외부 음원(예: Pixabay 곡)을 영상에 입히고, 엔딩은 항상 같은 사운드 로고(sting)로 끝냄.
 *   곡을 offset초 지점부터 재생 → sting 프리롤 직전에 페이드아웃 → sting 착지음이 hit초에 정확히 옴.
 *   곡과 sting은 각각 먼저 음량을 맞춘 뒤 섞음 (곡이 시끄러워도 sting 존재감이 일정하게 유지).
 * 사용: tsx scripts/mix-track.ts <video> <music> <offset> <sting.wav> <stingBpm> <hit> <out> [preroll]
 *   preroll: sting 파일 시작 → 착지음까지의 초. 외부 브랜드 사운드 파일일 때만 줌 (없으면 코드 sting의 프리롤)
 */
import { spawnSync } from "node:child_process";
import { stingPreroll } from "../engine/audio/score";

const [video, music, offArg, sting, bpmArg, hitArg, out, preArg] = process.argv.slice(2);
if (!out) throw new Error("usage: tsx scripts/mix-track.ts <video> <music> <offset> <sting.wav> <stingBpm> <hit> <out> [preroll]");
const offset = Number(offArg), hit = Number(hitArg), pre = preArg !== undefined ? Number(preArg) : stingPreroll(Number(bpmArg));
const dur = Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], { encoding: "utf8" }).stdout);
const stingAt = hit - pre;
const ms = Math.round(stingAt * 1000);
/*
 * 자연스러운 전환: 곡을 끊지 않고 "물러나게" 함
 *  - 착지 2마디 전부터 원음(dry)은 서서히 빠지고, 로우패스로 먹먹하게 깎은 곡(lp)이 그 자리를 채움
 *    → 소리가 멀어지는 느낌으로 자연스럽게 공간을 비움
 *  - 착지 후에도 먹먹한 곡이 sting 아래에 작게 남아 있다가 3.5초에 걸쳐 사라짐 → 뚝 끊김이 없음
 */
const bar = (60 / Number(bpmArg)) * 4;
const A = hit - bar * 2;          // 전환 시작
const TAIL = 3.5;                 // 착지 후 곡이 남아 있는 시간
const dryG = `if(lt(t,${A.toFixed(3)}),1,if(lt(t,${hit}),pow(1-(t-${A.toFixed(3)})/${(hit - A).toFixed(3)},1.6),0))`;
const lpG = `if(lt(t,${A.toFixed(3)}),0,if(lt(t,${hit}),0.55*(t-${A.toFixed(3)})/${(hit - A).toFixed(3)},max(0,0.55*(1-(t-${hit})/${TAIL}))))`;

const fc = [
  `[1:a]atrim=start=${offset}:duration=${dur + 1},asetpts=PTS-STARTPTS,aresample=48000,loudnorm=I=-17:TP=-2,afade=t=in:d=0.15,asplit[m1][m2]`,
  `[m1]volume='${dryG}':eval=frame[dry]`,
  `[m2]lowpass=f=900,lowpass=f=900,volume='${lpG}':eval=frame[lp]`,
  `[2:a]aresample=48000,loudnorm=I=-13:TP=-2,adelay=${ms}|${ms}[s]`,
  `[dry][lp][s]amix=inputs=3:normalize=0:duration=longest,atrim=0:${dur},afade=t=out:st=${(dur - 0.45).toFixed(3)}:d=0.45,alimiter=limit=0.78,volume=-1.5dB[a]`,
].join(";");
const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", video, "-i", music, "-i", sting, "-filter_complex", fc,
  "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out], { stdio: "inherit" });
if (r.status !== 0) throw new Error("ffmpeg failed");
console.log(`${out}: music from ${offset}s, sting landing at ${hit}s`);
