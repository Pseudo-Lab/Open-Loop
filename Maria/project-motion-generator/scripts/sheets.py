"""검토용 이미지: review.png (스틸 나란히), phone.png (휴대폰 피드 폭 390pt로 축소)"""
import sys, glob, os
from PIL import Image
d = sys.argv[1]
fs = sorted(glob.glob(f'{d}/stills/*.png'), key=os.path.getmtime)
for name, (w, h, gap) in {'review': (540, 675, 550), 'phone': (390, 488, 400)}.items():
    ims = [Image.open(f).convert('RGB').resize((w, h)) for f in fs]
    sh = Image.new('RGB', (gap * len(ims), h), 'white')
    for i, im in enumerate(ims): sh.paste(im, (i * gap, 0))
    sh.save(f'{d}/{name}.png')
print('sheets:', ', '.join(os.path.basename(f)[:-4] for f in fs))

# 안전 영역 검사: 가장자리 60px 안에 글자·도형이 있으면 경고 (워드마크가 있는 왼쪽 위는 제외)
import numpy as np
M = 60
warn = []
for f in fs:
    a = np.asarray(Image.open(f).convert('L'), dtype=np.int16)
    h, w = a.shape
    bg = int(np.median(a))
    ink = np.abs(a - bg) > 70          # 그레인(약한 노이즈)은 무시, 진한 획만
    ink[:150, :] = False               # 워드마크 줄
    edges = {'left': ink[:, :M], 'right': ink[:, w - M:], 'top': ink[:M, :], 'bottom': ink[h - M:, :]}
    hits = [k for k, v in edges.items() if v.sum() > 40]
    if hits: warn.append(f"{os.path.basename(f)[:-4]}: {', '.join(hits)}")
print('safe zone:', 'OK' if not warn else 'WARN ' + ' | '.join(warn))
