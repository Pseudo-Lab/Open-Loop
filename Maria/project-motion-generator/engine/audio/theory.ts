// 음악 이론 헬퍼: 음이름 → 주파수, 코드 정의
export const BPM = 100;
export const BEAT = 60 / BPM;   // 0.6s
export const BAR = BEAT * 4;    // 2.4s

const NAMES: Record<string, number> = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
/** "F#5" → Hz (A4 = 440) */
export function hz(note: string): number {
  const m = /^([A-G]#?)(-?\d)$/.exec(note);
  if (!m) throw new Error(`bad note ${note}`);
  const midi = NAMES[m[1]] + (Number(m[2]) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export interface Chord { name: string; bass: string; pad: string[]; arp: string[] }

/** D장조 4마디 루프: Dmaj9 → Bm9 → Gmaj9 → Asus4. 마지막이 서스4라 해결되지 않은 채 다음 루프로 넘어감 */
export const PROGRESSION: Chord[] = [
  { name: "Dmaj9", bass: "D2", pad: ["F#3", "A3", "C#4", "E4"], arp: ["D4", "F#4", "A4", "C#5", "E5", "C#5", "A4", "F#4"] },
  { name: "Bm9", bass: "B1", pad: ["D3", "F#3", "A3", "C#4"], arp: ["B3", "D4", "F#4", "A4", "C#5", "A4", "F#4", "D4"] },
  { name: "Gmaj9", bass: "G1", pad: ["B2", "D3", "F#3", "A3"], arp: ["G3", "B3", "D4", "F#4", "A4", "F#4", "D4", "B3"] },
  { name: "Asus4", bass: "A1", pad: ["D3", "E3", "A3", "B3"], arp: ["A3", "D4", "E4", "A4", "B4", "A4", "E4", "D4"] },
];

/** 사운드 로고 모티프: 녹색 점. 배경곡에서는 마지막 착지음(D6) 없이 3음만, 엔딩에서만 D6에 착지 */
export const MOTIF = ["D5", "F#5", "A5"] as const;
export const LANDING = "D6";
