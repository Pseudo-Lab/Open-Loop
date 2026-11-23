# Pseudo Lab 모션 플레이북

프로젝트 소개용 짧은 모션 영상(링크드인)을 **기획 → 스틸 확인 → 렌더 → 피드백 → 음악 → 포스트**까지 같은 방식으로 반복하기 위한 절차.
사례: `projects/legal-kg` (법률 지식 그래프 구축해보기), `projects/data-speak` (데이터는 여전히 말하지 않는다). 둘 다 가짜연구소 13기.

## 0. 입력 받기 (기획 전에 확인)
| 항목 | 예시 | 비고 |
|---|---|---|
| 프로젝트 계획서 | README, 노션 | 목표·로드맵·결과물·참여 방법을 여기서 뽑음 |
| 영상 언어 | 영문 먼저, 국문은 별도 버전 | 말장난은 언어마다 새로 찾음 (직역 금지) |
| 꼭 들어갈 정보 | 시리즈 맥락, 기간, 결과물 | 영상엔 핵심만, 나머지는 본문으로 |
| 링크 | GitHub, 프로젝트 페이지 | **영상에 URL 넣지 않음**, "Link in post ↓" |

## 1. 기획 (콘셉트 + 비트맵)
1. **점 하나가 모든 장면을 잇는다.** 녹색 점(#16A774)이 프로젝트의 핵심 단위를 상징하게 정한다 (지식 그래프 → 노드).
2. **말장난 2~3개** (장면당 1개). 각각 `project.ts`의 `wordplays`에 해설을 함께 적는다. 모든 장면은 `scenes`(화면에서 보이는 것 · 의미), 전문 용어는 `glossary`에 적는다 (단어 뜻·읽기 → 화면에서 일어나는 일 → 그래서 무슨 뜻인지 → 프로젝트와의 연결). 영어가 익숙하지 않은 사람이 읽고 이해할 수 있어야 한다. 글자를 빼거나 끼워 의미가 바뀌는 것. 기준: 실제 있을 법한 문구 · 빼기/더하기만으로 성립 · 남는 글자가 다음 장면으로 이어짐.
   - 법률 KG: `Hide Connections → Connections`, `Legalese → Legal ease`, `KNOWLEDGE → EDGE`
3. **장면 구성 (기본형)**: 훅(토글/UI) → 핵심 은유(그래프 등) → 맥락(시리즈·왜) → 로드맵 → 말장난 → 엔드카드 → 루프 복귀.
4. **비트맵**을 표로 쓰고, 스틸 4장(훅, 핵심 장면, 말장난, 엔드카드)을 먼저 보여준 뒤 승인받는다.

## 2. 구현
```bash
npm run new -- <slug>          # _template 복사
# film.ts: 장면 / timeline.ts: 구간별 보여줄 시간 / project.ts: copy·stills·music.hit
npm run build -- <slug> && npm run stills -- <slug> <slug> && python3 scripts/sheets.py out/<slug>
```
- 모든 화면은 `t`로만 계산 (상태·타이머·Math.random 금지). 그래서 어떤 프레임이든 즉시 뽑힘.
- 말장난은 `buildMorph()`: 접두어 삭제형은 `keepFrom`, 단어 삽입·글자 맞바꾸기는 `explicit` 짝 지정 (LCS는 의도와 다른 글자를 짝지을 수 있음).
  - 예: `Data speaks → Data still does not speak` (중간 삽입), `CAUSAL → CASUAL` (U·S 교환), `QUESTIONS → QUEST`
- 로고·워드마크는 `drawLogo()`/`wordmark()` (원본 SVG 패스).

## 3. 피드백 → 수정 규칙 (지난 프로젝트에서 실제로 나온 것들)
| 피드백 | 고치는 곳 |
|---|---|
| "전체가 빠르다" | `timeline.scaled(1.15, ["series"])` 또는 d 값. 장면 코드는 건드리지 않음 |
| "이 장면 읽기 전에 넘어간다" | 그 장면이 완성된 지점에 홀드 구간 추가 (두 줄 문장 ≈ 3초) |
| "전환이 오래 걸린다" | 해당 홀드 d를 줄임 (예: Connections 1.0 → 0.35초) |
| "이 부분이 정적이다" | 홀드 중에도 흐르는 대기 모션을 **영상 시간(frame.video)** 기준으로 추가 (장면 내부 시간은 홀드 동안 멈춰 있음) |
| "글씨가 작다" | `tokens.ts`의 `mobile` (1080px 영상 → 휴대폰 약 0.36배, **최소 30~36px**) |
| "홀드 스틸에서 마지막 요소가 아직 들어오는 중" | 홀드는 마지막 요소 착지 + 스프링 정착(약 0.35초) **뒤**에 시작. 스틸 시각도 홀드 안으로 |
| "음악 전환이 뚝 끊긴다" | `mix-track.ts`: 착지 2마디 전부터 로우패스로 물러나기 + 착지 후 3.5초 꼬리 |

## 4. 렌더 + 음악
```bash
npm run make -- <slug>    # build → stills → video(4병렬) → music → REPORT.md
```
- 시즌 곡: `music/season-track.mp3` (Pixabay, 재배포 금지 → git에 올리지 않음). 곡을 바꾸면 `python3 scripts/analyze-music.py music/season-track.mp3` 한 번.
- 엔딩 sting(사운드 로고)은 코드로 작곡 (`engine/audio`). 레–파#–라 → 높은 레 착지. 곡의 키·템포로 자동 조옮김.
- 곡 시작 지점은 `align-music.py`가 자동 선택: sting 착지가 강박 위 + 곡의 풀 사운드가 `project.music.events` 근처.

## 5. 검수 체크리스트 (make가 자동 확인하는 것 ✔ / 사람이 보는 것 👀)
- ✔ 루프 이음새: 첫 프레임 = 마지막 프레임
- ✔ sting 착지 오차 < 1프레임(16.7ms), 마지막 무음, 약 −15.5 LUFS / 트루피크 −1.5 dBFS
- ✔ 안전 영역: 스틸의 가장자리 60px 안에 진한 획이 있으면 sheets.py가 경고 (워드마크 줄 제외)
- 👀 phone.png로 휴대폰 크기 가독성
- 👀 나가는 글자와 들어오는 글자가 같은 시간에 겹치지 않음
- 👀 녹색은 점·선·큰 글씨에만 (작은 글씨 대비 부족)
- 👀 길이 30초 안팎 (넘으면 다른 곳을 줄이고 늘림)
- 👀 이어폰 + 휴대폰 스피커 둘 다로 듣기 (Claude는 소리를 못 들음)

## 6. 업로드
- 결과물에 `GUIDE.md`(영상 해설서: 한눈에 보기 · 장면별 해설 · 말장난 해설 · 키워드 해설)가 함께 나옴. 시간은 타임라인에서 자동 계산. 결과를 전달할 때 이 해설을 함께 설명한다 (`npm run make`가 자동 생성, 단독 실행은 `tsx scripts/guide.ts <slug>`)
- 4:5 (1080×1350), 음소거 자동재생 기준으로 읽히게
- 커스텀 썸네일 = 엔드카드 스틸 (첫 프레임은 루프용이라 썸네일로 약함)
- 본문: 첫 줄에 영상 속 말장난 → 프로젝트 소개 → 로드맵 → 참여 방법 → 링크 → 해시태그. 음악 크레딧 한 줄 권장.

## 알려진 함정
- 캔버스 상태(lineCap 등)가 프레임 사이에 새면 루프 이음새가 깨짐 → `runtime.ts`가 매 프레임 save/restore
- 프레임마다 랜덤 그레인 → H.264 블록 깨짐 + 용량 폭증 → 시드 고정 정적 텍스처
- TT Barrels Italic(피그마의 "Project")은 상용 폰트 → 지금은 Fraunces Italic으로 대체. 라이선스 확보 시 `tokens.ts`의 `font.italic`만 교체
- Suno 무료 플랜 곡은 Suno 소유·비상업·다운로드 불가 → 쓰지 않음
- 렌더 명령이 오래 걸리면 구간을 나눠 병렬로 (make-video가 자동)

## 사례별 기획 요약
| 프로젝트 | 녹색 점의 의미 | 말장난 | 길이 |
|---|---|---|---|
| legal-kg | 지식 그래프의 노드 | Hide Connections→Connections · Legalese→Legal ease · KNOWLEDGE→EDGE | 31.5초 |
| data-speak | 문장의 마침표 = 데이터 포인트 | Data speaks→Data still does not speak · CAUSAL→CASUAL · QUESTIONS→QUEST | 26.3초 |
