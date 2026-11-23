# Claude 작업 지침 (project-motion-generator)

이 레포로 새 프로젝트 영상을 만들 때는 **PLAYBOOK.md의 순서를 그대로** 따른다.
1. 계획서를 읽고 PLAYBOOK §0 입력을 확인 → 2. 콘셉트·말장난·비트맵 제안 → 3. 스틸 확인 후 승인받기 → 4. `npm run make -- <slug>` → 5. 피드백은 PLAYBOOK §3 표대로.

- 장면 코드: `projects/<slug>/film.ts`, 속도: `timeline.ts`, 메타: `project.ts`
- 공용 엔진 수정 시 `projects/legal-kg`가 픽셀 단위로 그대로인지 확인 (기존 프레임과 diff)
- 스크립트 실행 시간이 길면 백그라운드로, 프레임 렌더는 make-video의 병렬 분할 사용
- 결과를 전할 때는 **선택 이유, 장점, 단점, 문제가 생길 수 있는 부분**과 GUIDE.md의 장면별 해설을 함께 설명. 코드는 TypeScript.
- 상세 절차: `.claude/skills/project-motion/SKILL.md` (Claude Code는 이 레포에서 자동으로 불러옴)
