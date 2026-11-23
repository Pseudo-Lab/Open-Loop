"""브랜드 사운드 파일에서 착지음(가장 강한 어택)이 오는 시각을 측정.
사용: python3 scripts/sting-landing.py <sting.wav>  → 마지막 줄에 초 단위 숫자
1) onset 강도가 가장 큰 프레임을 찾고 2) 그 주변에서 진폭이 국소 최대의 50%를 처음 넘는 샘플로 정밀화
   (make-music.ts의 landing_error_ms 검수와 같은 기준이라, 믹스 후 오차가 0에 가깝게 나옴)
"""
import sys
import numpy as np
import librosa

y, sr = librosa.load(sys.argv[1], sr=None, mono=True)
env = librosa.onset.onset_strength(y=y, sr=sr)
frames = librosa.onset.onset_detect(onset_envelope=env, sr=sr)
if len(frames) == 0:
    raise SystemExit("onset 없음")
f = max(frames, key=lambda i: env[i])
c = librosa.frames_to_time(f, sr=sr)
a = np.abs(y)
s, e = int(max(0, c - 0.06) * sr), int((c + 0.08) * sr)
w = a[s:e]
print(f"{(s + int(np.argmax(w > 0.5 * w.max()))) / sr:.4f}")
