"""곡 시작 지점 자동 선택.
조건: sting 착지(hit)가 곡의 1박/3박 위 · 곡 시작이 다운비트 근처 · 곡의 풀 사운드 진입이 영상 이벤트 근처
사용: python3 scripts/align-music.py <hit> <duration> '<events json>'  → JSON 한 줄 (offset 등)
"""
import sys, json, numpy as np
hit, dur, events = float(sys.argv[1]), float(sys.argv[2]), json.loads(sys.argv[3])
m = json.load(open('music/season.json'))
beats, down = np.array(m['beats']), np.array(m['downbeats'])
phase = m['beat_phase']
best = None
for j, b in enumerate(beats):
    k = (j - phase) % 4
    if k not in (0, 2): continue
    o = b - hit
    if o < 0 or o + dur > m['duration'] - 1: continue
    start_off = float(np.min(np.abs(down - o)))
    cands = [(abs((fe - o) - t), name, fe - o) for fe in m['full_entries'] for name, t in events.items() if 0 < fe - o < hit]
    ev = min(cands) if cands else (5.0, None, None)
    # 구간 경계(풀 진입·브레이크다운)가 영상 첫 2초 안에 있으면 시작이 어색함 → 큰 벌점
    bounds = m['full_entries'] + m.get('drops', [])
    edge = 3.0 if any(o + 0.05 < x < o + 2.0 for x in bounds) else 0
    cost = ev[0] + start_off + edge + (0 if k == 0 else 0.15)   # 1박 착지를 약간 선호
    if best is None or cost < best[0]:
        best = (cost, o, 'beat1' if k == 0 else 'beat3', start_off, ev)
if best is None: raise SystemExit("no valid offset: track too short for this video")
_, o, on, so, ev = best
print(json.dumps({"offset": round(float(o), 3), "hit_on": on, "start_off_downbeat_ms": round(so * 1000),
                  "full_section_at": None if ev[2] is None else round(float(ev[2]), 2), "near_event": ev[1]}))
