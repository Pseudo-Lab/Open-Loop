"""시즌 곡 분석 (1회): BPM, 조성, 박/다운비트, 풀 사운드 진입 지점 → music/season.json
사용: python3 scripts/analyze-music.py music/season-track.mp3
"""
import sys, json, numpy as np, librosa

MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

path = sys.argv[1]
y, sr = librosa.load(path, sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
tempo = float(np.atleast_1d(tempo)[0])
chroma = librosa.feature.chroma_cqt(y=librosa.effects.harmonic(y), sr=sr).mean(axis=1)
scores = [(np.corrcoef(np.roll(MAJ, i), chroma)[0, 1], i, 'major') for i in range(12)] + \
         [(np.corrcoef(np.roll(MIN, i), chroma)[0, 1], i, 'minor') for i in range(12)]
score, root, mode = max(scores)
# 다운비트: 4박 위상 중 온셋이 가장 강한 것
onset = librosa.onset.onset_strength(y=y, sr=sr); ot = librosa.times_like(onset, sr=sr)
phase = int(np.argmax([np.interp(beats[p::4], ot, onset).sum() for p in range(4)]))
downbeats = beats[phase::4]
# 마디별 에너지 → 직전 4마디보다 1.6배 이상 커지는 지점 = 풀 사운드 진입
rms = librosa.feature.rms(y=y)[0]; rt = librosa.times_like(rms, sr=sr)
bar_rms = [float(rms[(rt >= a) & (rt < b)].mean()) for a, b in zip(downbeats[:-1], downbeats[1:])]
full = []
for i in range(4, len(bar_rms)):
    if bar_rms[i] > 1.6 * np.mean(bar_rms[i - 4:i]) and (not full or downbeats[i] - full[-1] > 8):  # 같은 진입을 두 번 세지 않음
        full.append(float(downbeats[i]))
# 에너지가 크게 떨어지는 지점(브레이크다운). 곡 시작이 이 근처면 시작하자마자 소리가 꺼진 것처럼 들림
drops = []
for i in range(4, len(bar_rms)):
    if bar_rms[i] < 0.62 * np.mean(bar_rms[i - 4:i]) and (not drops or downbeats[i] - drops[-1] > 8):
        drops.append(float(downbeats[i]))
# 메이저 기준 sting(D장조)을 곡 키로 옮길 반음 수 (단조면 나란한조 장조로)
major_root = root if mode == 'major' else (root + 3) % 12
semis = (major_root - 2) % 12
semis = semis - 12 if semis > 6 else semis
out = {
    "file": path, "duration": len(y) / sr, "bpm": round(tempo, 2),
    "key": f"{NAMES[root]} {mode}", "key_confidence": round(float(score), 2), "sting_semitones": int(semis),
    "beat_phase": phase, "beats": [round(float(b), 4) for b in beats],
    "downbeats": [round(float(b), 4) for b in downbeats], "full_entries": full, "drops": drops,
}
json.dump(out, open('music/season.json', 'w'), indent=1)
print(f"drops at {[round(x,1) for x in drops]} · {out['bpm']} BPM, {out['key']} (conf {out['key_confidence']}), sting +{semis} semitones, full sections at {[round(x,1) for x in full]}")
