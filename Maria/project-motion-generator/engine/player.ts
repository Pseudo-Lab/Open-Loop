// 미리보기 플레이어: 재생 루프만 담당 (그리기는 seek(t)로만)
const DUR = window.DURATION;
const play = document.getElementById("play") as HTMLButtonElement;
const scrub = document.getElementById("scrub") as HTMLInputElement;
const clock = document.getElementById("clock") as HTMLSpanElement;
let playing = true, t = 0, last = 0;
function show(time: number) {
  t = ((time % DUR) + DUR) % DUR;
  window.seek(t);
  scrub.value = String(t);
  clock.textContent = `${t.toFixed(2)}s / ${DUR.toFixed(1)}s`;
}
function frame(now: number) {
  if (playing) show(t + Math.min(0.1, (now - last) / 1000));
  last = now;
  requestAnimationFrame(frame);
}
window.filmReady.then(() => { scrub.max = String(DUR); show(0); last = performance.now(); requestAnimationFrame(frame); });
const setPlaying = (p: boolean) => { playing = p; play.textContent = p ? "Pause" : "Play"; play.setAttribute("aria-pressed", String(p)); };
play.addEventListener("click", () => setPlaying(!playing));
scrub.addEventListener("input", () => { setPlaying(false); show(Number(scrub.value)); });
document.querySelectorAll<HTMLButtonElement>("[data-v]").forEach((b) =>
  b.addEventListener("click", () => { setPlaying(false); show(Number(b.dataset.v)); }));
