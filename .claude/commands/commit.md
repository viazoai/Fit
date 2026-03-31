---
description: Git 커밋 생성 (Phase 태그 포함, 한국어 메시지)
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*), Read
---

# Commit

변경된 파일을 분석하고, `docs/PLAN.md`의 Phase 단계에 맞춰 커밋을 생성한다.

## 커밋 메시지 포맷

```
[Phase N] 작업 내용 한 문장 요약

- 세부 작업 내용 1
- 세부 작업 내용 2
- 세부 작업 내용 3
```

## 규칙

1. **Phase 태그**: `docs/PLAN.md`를 읽고, 현재 변경 사항이 어느 Phase에 해당하는지 판단하여 `[Phase 0]`, `[Phase 1]` 등을 붙인다. Phase에 속하지 않는 작업은 아래 카테고리를 사용한다.
   - `[UI]` — 디자인 시스템, 스타일링, 레이아웃 등 시각적 변경
   - `[DB]` — 스키마 변경, 마이그레이션, 시드 데이터
   - `[API]` — API 엔드포인트 추가/수정 (라우터, 스키마)
   - `[AI]` — 프롬프트, AI 에이전트 로직 변경
   - `[Docs]` — 문서, 계획, README 등
   - `[Fix]` — 버그 수정
   - `[Refactor]` — 기능 변경 없는 코드 구조 개선
   - `[Config]` — 빌드, 린터, Docker, CI/CD 등 설정 변경
   - `[Test]` — 테스트 추가/수정
   - `[Chore]` — 위 어디에도 해당하지 않는 잡무
2. **Title**: Phase 태그 뒤에 작업 내용을 한국어 한 문장으로 작성한다. 70자 이내.
3. **Body**: 세부 작업 내용을 불릿(`-`)으로 나열한다. 각 항목은 간결하게.
4. **Co-Author**: 마지막 줄에 `Co-Authored-By: Claude <noreply@anthropic.com>` 을 추가한다.
5. 커밋 대상에서 `.env`, 크레덴셜 파일 등 민감 파일은 제외한다.

## 예시

```
[Phase 0] Vite + React + TypeScript 프로젝트 초기화

- Vite 프로젝트 스캐폴딩 (React + TypeScript 템플릿)
- Tailwind CSS v4 설치 및 설정
- ESLint + Prettier 기본 설정 추가

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
[Phase 1] 하단 탭 네비게이션 및 앱 셸 구현

- BottomNav 컴포넌트 구현 (홈/기록/캘린더/더보기)
- AppShell 레이아웃 적용
- React Router 페이지 라우팅 연결

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
[Docs] 개발 계획 문서 작성

- docs/PLAN.md 추가 (6단계 Phase 구조)
- 데이터 모델 및 화면 구조 설계 포함

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 실행 절차

1. `git status`와 `git diff`로 변경 사항 확인
2. `docs/PLAN.md`를 읽고 해당 Phase 판단
3. `git log --oneline -5`로 최근 커밋 스타일 확인
4. 위 포맷에 맞춰 커밋 메시지 작성
5. 변경 파일 스테이징 후 커밋
