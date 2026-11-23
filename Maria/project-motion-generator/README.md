# project-motion-generator

가짜연구소 프로젝트 소개 모션 영상 엔진. 녹색 점 하나로 이어지는 4:5 루프 영상 + 시즌 음악 + 엔딩 사운드 로고.

## 처음 쓰는 사람: 3단계

**1. 받기**

이 레포는 **private**이라 접근 권한이 있는 GitHub 계정으로 로그인해야 받아집니다 ([gh CLI](https://cli.github.com) 기준).
```bash
gh auth login                                          # 이미 로그인돼 있으면 생략
gh auth status                                         # 계정을 여러 개 쓴다면 권한 있는 쪽이 active인지 확인
                                                       #   아니면: gh auth switch --user <계정>
gh repo clone Globalkmaria/project-motion-generator
```
> `Repository not found`가 뜨면 레포가 없는 게 아니라 **그 계정에 권한이 없다**는 뜻입니다 (다른 계정이 active인 경우 포함). 권한 요청은 레포 소유자에게.

이어서 설치합니다. 한 줄이라도 실패하면 거기서 멈추도록 `&&`로 이어 붙였습니다 — 그냥 줄바꿈으로 두면 `cd`가 실패해도 나머지가 **엉뚱한 폴더에서** 실행됩니다.
```bash
cd project-motion-generator && \
npm install && \
npx playwright install chromium && \
python3 -m pip install librosa numpy pillow && \
npm run doctor                         # 빠진 게 있으면 설치 방법을 알려줌
```
- **ffmpeg**도 필요합니다 (위 명령에 없음) — macOS: `brew install ffmpeg` · Windows: `winget install ffmpeg`
- `pip` 말고 `python3 -m pip`인 이유: 스크립트가 `python3`를 호출하는데, 파이썬이 여러 개 깔린 환경에선 `pip`가 다른 파이썬에 설치해서 `npm run doctor`가 계속 실패합니다.
- `Missing script: "doctor"`가 뜨면 레포 폴더 밖에서 실행한 것입니다. `pwd`로 확인하세요.

시즌 곡은 레포에 없습니다. `music/README.md`의 Pixabay 링크에서 각자 받아 `music/season-track.mp3`로 저장하세요 (없으면 음악 없이 영상까지만 만들어짐).

**2. Claude에게 맡기기 (추천 — 기본 사용법)**

**반드시 이 폴더를 작업 폴더로 열어야 합니다.** `CLAUDE.md`와 `.claude/skills/project-motion`은 작업 폴더 기준으로 불러와지므로, 다른 데서 열면 **아무 경고 없이** 로드되지 않습니다.
```bash
cd project-motion-generator && claude      # IDE·데스크톱 앱이면 이 폴더를 열기
```
제대로 걸렸는지 한 줄로 확인:
```
지금 쓸 수 있는 스킬 중에 project-motion 있어? 이름 그대로 알려줘.
```
이름이 **정확히 `project-motion`**이어야 합니다. `pseudolab-project-motion` 같은 다른 이름이 나오면 폴더 밖에서 열었거나, 계정에 남아 있는 **예전 버전 스킬**이 대신 걸린 것입니다 — 그 경우 옛 레포 이름(`pseudolab-motion`)을 들고 엉뚱한 설치 안내를 하니, 폴더를 다시 확인하고 예전 스킬은 지우세요.

그 다음 아래 틀로 요청합니다. **네 가지를 처음에 같이 주면** 되묻지 않고 바로 기획에 들어갑니다.
```
<프로젝트 README 링크 또는 계획서 붙여넣기>

이 프로젝트를 소개하는 링크드인 모션 영상을 만들어줘.
- 언어: 영문 먼저 (국문은 나중에 별도 버전)
- 꼭 들어갈 것: <기수·기간 / 로드맵 / 참여 방법 중 필수인 것>
- 포스트용 링크: <GitHub·프로젝트 페이지>   # 영상 안에는 URL을 넣지 않음
콘셉트·말장난·비트맵이랑 스틸부터 보여줘.
```
진행 순서는 **기획 → 스틸 4장 확인 → 렌더 → 피드백 → 음악 → 해설서**이고, **스틸 단계에서 한 번 멈춰 승인을 받습니다.** 피드백은 그대로 말하면 됩니다: "전체 1.2배 느리게", "이 장면 읽기 전에 넘어가", "여기가 너무 정적이야", "글씨가 작아".

알아둘 것
- Claude는 **소리를 못 듣습니다.** 음악·sting은 수치(착지 오차·LUFS)로만 검수하니, 최종 확인은 이어폰과 폰 스피커로 직접 하세요.
- 시즌 곡이 없으면 무음 `video.mp4`까지만 나옵니다 (위 1단계 참고).
- 기획을 건너뛰고 바로 렌더하려 하면 `PLAYBOOK.md 순서대로 진행해`라고 하면 됩니다.

**3. 직접 하기 (2번으로 충분합니다 — 엔진을 직접 만지거나 디버깅할 때)**
```bash
npm run new -- my-project      # projects/_template 복사
# projects/my-project/film.ts(장면) · timeline.ts(속도) · project.ts(문구·해설·음악 시점) 수정
npm run build -- my-project && npm run stills -- my-project stills && python3 scripts/sheets.py out/my-project
npm run make -- my-project     # 빌드 → 스틸 → 영상 → 음악 → REPORT.md · GUIDE.md
```
`out/my-project/index.html`을 브라우저로 열면 타임라인을 드래그하며 볼 수 있습니다.

## 결과물
**확인·업로드할 파일은 `out/<slug>/deliver/` 한 폴더에**: `<프로젝트명>_final.mp4` · `_thumbnail.png`(엔드카드) · `_linkedin-post.txt` · `_review.png` (예: `Science-Agent-Leaderboard_final.mp4`)

`out/<slug>/` 전체: `final.mp4`(음악 포함) · `video.mp4`(무음) · `stills/` · `review.png` · `phone.png`(휴대폰 크기) · `GUIDE.md`(장면·말장난·키워드 해설) · `REPORT.md`(타임라인·음향 검수)

| 폴더 | 내용 |
|---|---|
| `engine/` | 스프링, 글자 morph, 타임라인 워프, 브랜드 토큰·로고·그리기, 런타임, 오디오(sting 작곡) |
| `projects/<slug>/` | 프로젝트별 장면(film.ts), 속도(timeline.ts), 메타(project.ts) |
| `scripts/` | build · render · make-video · analyze/align-music · mix-track · make |
| `music/` | 시즌 곡 분석 결과(season.json). 음원 파일 자체는 git 제외 |

결과물: `out/<slug>/final.mp4`(음악 포함), `video.mp4`, `review.png`, `phone.png`, `stills/`, `index.html`(미리보기), `REPORT.md`.

## 폰트
Hepta Slab, IBM Plex Sans, Fraunces Italic (모두 SIL OFL) — `assets/fonts/`에 포함.

## 라이선스 주의
- 시즌 곡(Pixabay Content License)은 영상에 넣어 쓰는 것은 가능하지만 음원 단독 재배포는 금지 → 레포에 포함하지 않음.
- 엔딩 sting과 엔진 코드는 직접 작성.
