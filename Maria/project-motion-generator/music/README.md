# 시즌 음악
- 곡: "Tutorial Music Informative Clean Minimalist Explainer Tech Background" by alexrockbeat (Pixabay)
  https://pixabay.com/music/corporate-tutorial-music-informative-clean-minimalist-explainer-tech-background-623791/
- 파일을 `music/season-track.mp3`로 저장 (git 제외: 재배포 금지)
- `season.json`: analyze-music.py 결과 (123 BPM, F major, sting +3 반음)
- 포스트 크레딧 예: "Music: alexrockbeat via Pixabay"

## 브랜드 사운드 (엔딩 sting 파일)
- 프로젝트가 `project.ts`에 `music.sting = { file: "music/brand-sting.wav" }`를 지정하면, 코드로 작곡한 sting 대신 이 파일을 **원본 그대로**(조옮김 없음) 엔딩에 씀
- 착지음 위치는 `scripts/sting-landing.py`가 자동 측정 (현재 파일: 0.908초)
- 파일은 git 제외(`music/*.wav`): 받는 사람이 직접 `music/brand-sting.wav`로 저장. 없으면 `make`의 music 단계가 오류로 멈춤
- 사용 중: `projects/science-agent`

## 라이선스 기록 (분쟁 대비 보관)
- 라이선스: Pixabay Content License (Terms §5). 출처 표기 불필요, 상업·비상업 사용과 수정 허용
- 다운로드: 2026-11-01, 위 트랙 페이지에서 Maria가 직접 다운로드
- 허용 근거: 영상·모션·사운드 로고와 결합한 새 창작물로만 사용 (단독 재배포 아님)
- 금지 사항 준수: 음원 단독 배포 X (git 제외) · 상표/사운드 로고로 등록·사용 X (브랜드 sting은 별도 자작) · 정치적 사용 X
- 보관 권장: 트랙 페이지 스크린샷(라이선스 표기 포함)을 이 폴더에 함께 저장
- 클레임 발생 시 (Terms §11): 즉시 사용 중단·삭제 후 info@pixabay.com 에 알림
