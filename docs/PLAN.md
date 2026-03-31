# Fit (A-Fit) 개발 계획

> 최종 수정: 2026-03-31

## 목차
1. [개발 원칙](#1-개발-원칙)
2. [페이즈 개요](#2-페이즈-개요)
3. [Phase 0 — 프로젝트 부트스트랩](#3-phase-0--프로젝트-부트스트랩)
4. [Phase 1 — 프론트엔드 코어 UI](#4-phase-1--프론트엔드-코어-ui)
5. [Phase 2 — 백엔드 API + DB](#5-phase-2--백엔드-api--db)
6. [Phase 3 — 프론트-백 연동](#6-phase-3--프론트-백-연동)
7. [Phase 4 — AI 에이전트 통합](#7-phase-4--ai-에이전트-통합)
8. [Phase 5 — Duo-Sync (부부 공유)](#8-phase-5--duo-sync-부부-공유)
9. [Phase 6 — PWA + 배포](#9-phase-6--pwa--배포)
10. [데이터 모델 설계](#10-데이터-모델-설계)
11. [화면 구조 (Screen Map)](#11-화면-구조-screen-map)
12. [기술 스택 상세](#12-기술-스택-상세)

---

## 1. 개발 원칙

| 원칙 | 설명 |
|------|------|
| **프론트엔드 퍼스트** | UI/UX를 먼저 완성한 후 백엔드를 붙인다. Mock 데이터로 화면을 먼저 확인한다. |
| **모바일 퍼스트** | 375px 기준으로 설계 → `md:`(768px)에서 확장. |
| **점진적 복잡도** | 단순 기록 → AI 추천 → 부부 공유 순서로 기능을 확장한다. |
| **2인 특화** | 대규모 사용자가 아닌 부부 2인만을 위한 설계. 인증은 가볍게, UX는 깊게. |
| **프라이버시 중심** | 모든 데이터는 홈랩에 보관. 외부 전송은 AI API 호출뿐. |

---

## 2. 페이즈 개요

```
Phase 0  프로젝트 부트스트랩         ← 지금 여기
Phase 1  프론트엔드 코어 UI          ← 첫 번째 목표
Phase 2  백엔드 API + DB
Phase 3  프론트-백 연동
Phase 4  AI 에이전트 통합
Phase 5  Duo-Sync (부부 공유)
Phase 6  PWA + 홈랩 배포
```

---

## 3. Phase 0 — 프로젝트 부트스트랩

**목표:** 개발 환경과 프로젝트 스캐폴딩 완성

### 작업 목록

- [x] Vite + React + TypeScript 프로젝트 초기화
- [x] Tailwind CSS v4 설정
- [x] shadcn/ui 설치 및 Polar 프로젝트 디자인 시스템 이식
  - `components/ui/` 기본 컴포넌트 (Button, Card, Input, Dialog 등)
  - `lib/utils.ts` (`cn()` 유틸리티)
- [x] React Router 설정 (모바일 탭 네비게이션 구조)
- [x] 프로젝트 디렉토리 구조 확정
- [x] ESLint + Prettier 설정
- [x] `useIsMobile()` 훅 구현

### 예상 디렉토리 구조

```
frontend/
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui 컴포넌트
│   │   ├── layout/          # AppShell, BottomNav, Header
│   │   └── workout/         # 운동 관련 도메인 컴포넌트
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── home.tsx
│   │   ├── workout-log.tsx
│   │   ├── library.tsx
│   │   ├── calendar.tsx
│   │   ├── report.tsx
│   │   └── profile.tsx
│   ├── types/
│   │   └── index.ts
│   ├── mocks/               # Phase 1에서 사용할 목 데이터
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 4. Phase 1 — 프론트엔드 코어 UI

**목표:** Mock 데이터 기반으로 모든 핵심 화면 구현 (백엔드 없이 동작)

### 1-1. 앱 셸 (App Shell)

- [ ] 하단 탭 네비게이션 (홈 / 기록 / 캘린더 / 더보기)
- [ ] 상단 헤더 (사용자 프로필 아바타 + 앱 로고)
- [ ] 페이지 전환 애니메이션

### 1-2. 홈 화면

- [ ] 오늘의 운동 요약 카드
- [ ] 이번 주 운동 현황 (진행률 바)
- [ ] 빠른 운동 시작 버튼
- [ ] 파트너 활동 미리보기 카드 (Duo-Sync 프리뷰)

### 1-3. 운동 기록 (Workout Log)

- [ ] 운동 세션 생성 플로우
  1. 운동 부위 선택 (가슴/등/어깨/하체/팔/코어/유산소)
  2. 운동 종목 선택 (라이브러리에서 검색/선택)
  3. 세트별 입력 (무게 kg × 횟수 Reps)
  4. RPE 입력 (1~10 슬라이더)
  5. 메모/컨디션 입력
- [ ] 세트 추가/삭제 인터랙션
- [ ] 휴식 타이머 (세트 간)
- [ ] 운동 완료 시 요약 화면

### 1-4. 운동 라이브러리 (Exercise Library)

- [ ] 운동 카드 리스트 (썸네일 + 이름 + 부위 태그)
- [ ] 부위별/장비별 필터
- [ ] 검색 기능
- [ ] 운동 상세 화면
  - YouTube 영상 임베드
  - 주동근/보조근 표시
  - 난이도 뱃지
  - MET 계수 정보

### 1-5. 캘린더 뷰

- [ ] 월간 캘린더 (운동한 날 마킹)
- [ ] 날짜 선택 시 해당 일 운동 기록 요약
- [ ] 연속 운동일(스트릭) 표시

### 1-6. 프로필/설정

- [ ] 사용자 프로필 편집 (닉네임, 신체 정보)
- [ ] 운동 목표 설정
- [ ] 보유 장비 선택
- [ ] 부상/특이사항 입력

---

## 5. Phase 2 — 백엔드 API + DB

**목표:** FastAPI + PostgreSQL로 데이터 영속성 확보

### 2-1. 프로젝트 구조

```
backend/
├── app/
│   ├── main.py              # FastAPI 앱 진입점
│   ├── config.py            # 환경 변수, DB URL 등
│   ├── models/              # SQLAlchemy ORM 모델
│   │   ├── user.py
│   │   ├── exercise.py
│   │   └── workout.py
│   ├── schemas/             # Pydantic 스키마 (요청/응답)
│   ├── routers/             # API 엔드포인트
│   │   ├── auth.py
│   │   ├── exercises.py
│   │   ├── workouts.py
│   │   ├── calendar.py
│   │   └── users.py
│   ├── services/            # 비즈니스 로직
│   └── db.py                # DB 세션 관리
├── alembic/                 # DB 마이그레이션
├── requirements.txt
└── Dockerfile
```

### 2-2. 데이터베이스

- [ ] PostgreSQL Docker 컨테이너 설정
- [ ] Alembic 마이그레이션 초기화
- [ ] 테이블 생성 (아래 [데이터 모델](#10-데이터-모델-설계) 참조)

### 2-3. API 엔드포인트

| 리소스 | Method | 경로 | 설명 |
|--------|--------|------|------|
| 인증 | POST | `/api/auth/login` | 간단 로그인 (2인 전용) |
| 운동 마스터 | GET | `/api/exercises` | 운동 목록 (필터, 검색) |
| 운동 마스터 | GET | `/api/exercises/:id` | 운동 상세 |
| 워크아웃 | POST | `/api/workouts` | 운동 세션 생성 |
| 워크아웃 | GET | `/api/workouts` | 운동 기록 목록 (날짜 필터) |
| 워크아웃 | GET | `/api/workouts/:id` | 운동 세션 상세 |
| 워크아웃 | PUT | `/api/workouts/:id` | 운동 세션 수정 |
| 캘린더 | GET | `/api/calendar?month=` | 월간 운동 현황 |
| 사용자 | GET | `/api/users/me` | 내 프로필 |
| 사용자 | PUT | `/api/users/me` | 프로필 수정 |

### 2-4. 인증

- [ ] 부부 2인 전용이므로 간단한 PIN 또는 패스워드 기반 인증
- [ ] JWT 토큰 발급/검증
- [ ] 사용자 식별 (owner 구분)

---

## 6. Phase 3 — 프론트-백 연동

**목표:** Mock 데이터를 실제 API로 교체

- [ ] API 클라이언트 설정 (`fetch` 래퍼 또는 `ky`/`ofetch`)
- [ ] 각 페이지의 Mock 데이터 → API 호출로 전환
- [ ] 로딩/에러 상태 UI 처리
- [ ] 낙관적 업데이트 (운동 기록 저장 시)
- [ ] 오프라인 폴백 (로컬 스토리지 큐잉)

---

## 7. Phase 4 — AI 에이전트 통합

**목표:** GPT 기반 운동 추천 및 인사이트 제공

### 4-1. AI 루틴 Maestro

- [ ] 프롬프트 엔지니어링: 사용자 프로필 + 최근 운동 기록 → 오늘의 루틴 추천
- [ ] API 엔드포인트: `POST /api/ai/routine-suggestion`
- [ ] 프론트엔드: 홈 화면 "AI 추천 루틴" 카드
- [ ] 추천 수락 시 → 워크아웃 세션 자동 생성

### 4-2. AI 인사이트 리포트

- [ ] 주간/월간 리포트 생성 (`POST /api/ai/report`)
- [ ] 분석 항목:
  - 운동 볼륨 트렌드 (총 무게 × 횟수)
  - 부위별 균형 분석
  - RPE 추이와 과훈련 경고
  - 체중 변화 상관관계 (체중 데이터 입력 시)
- [ ] 프론트엔드: 리포트 탭 (차트 + AI 코멘트)

### 4-3. 자동 칼로리 계산

- [ ] MET 계수 × 체중 × 시간 → 소모 칼로리 자동 산출
- [ ] 운동 완료 시 요약 화면에 표시

---

## 8. Phase 5 — Duo-Sync (부부 공유)

**목표:** 부부 간 실시간 운동 공유 및 동기 부여 기능

### 5-1. 파트너 활동 피드

- [ ] 파트너 운동 시작/완료 알림
- [ ] 하이파이브(응원) 리액션
- [ ] 실시간 알림 방식 결정: SSE vs WebSocket vs 폴링

### 5-2. 공유 캘린더

- [ ] 캘린더에 부부 운동 현황 동시 표시 (색상 구분)
- [ ] 같은 날 운동 → "커플 데이" 마킹
- [ ] 월간 커플 달성률 비교

### 5-3. 프라이버시 필터

- [ ] 공유 항목: 운동 종목, 시간, 완료 여부
- [ ] 비공유 항목: 몸무게, 체지방률 등 민감 수치
- [ ] 설정에서 공유 범위 조절 가능

---

## 9. Phase 6 — PWA + 배포

**목표:** 홈랩 배포 및 모바일 앱 경험 완성

### 6-1. PWA 설정

- [ ] `manifest.json` (앱 이름, 아이콘, 색상)
- [ ] Service Worker (오프라인 캐싱)
- [ ] 홈 화면 설치 프롬프트

### 6-2. Docker Compose

```yaml
# docker-compose.yml (예상 구조)
services:
  frontend:
    build: ./frontend
    ports: ["3102:80"]

  backend:
    build: ./backend
    ports: ["8102:8000"]
    environment:
      - DATABASE_URL=postgresql://...
      - OPENAI_API_KEY=${OPENAI_API_KEY}

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data

  # Cloudflare Tunnel로 외부 접근
```

### 6-3. 배포

- [ ] N100 미니 PC에 Docker Compose로 배포
- [ ] Cloudflare Tunnel 설정 (HTTPS 외부 접근)
- [ ] 자동 백업 스크립트 (PostgreSQL dump)

---

## 10. 데이터 모델 설계

### users (사용자)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| nickname | VARCHAR(50) | 닉네임 |
| password_hash | VARCHAR | 인증용 |
| weight_kg | DECIMAL(5,2) | 현재 몸무게 |
| height_cm | DECIMAL(5,2) | 키 |
| age | INT | 나이 |
| gender | ENUM | 성별 |
| muscle_mass_kg | DECIMAL(5,2) | 골격근량 (선택) |
| body_fat_pct | DECIMAL(4,1) | 체지방률 (선택) |
| fitness_goal | VARCHAR | 운동 목표 |
| equipment | JSONB | 보유 장비 목록 |
| injuries | TEXT | 부상/특이사항 |
| created_at | TIMESTAMP | 가입일 |

### exercises (운동 마스터 데이터)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| name_ko | VARCHAR(100) | 한글 명칭 |
| name_en | VARCHAR(100) | 영문 명칭 |
| body_part | VARCHAR(30) | 운동 부위 (가슴, 등, 하체 등) |
| primary_muscle | VARCHAR(50) | 주동근 |
| secondary_muscle | VARCHAR(50) | 보조근 |
| exercise_type | ENUM | 무산소/유산소/스트레칭 |
| difficulty | ENUM | 초급/중급/고급 |
| equipment | VARCHAR(30) | 필요 장비 |
| youtube_url | VARCHAR(500) | 유튜브 가이드 URL |
| youtube_start_sec | INT | 영상 시작 시간(초) |
| description | TEXT | 운동 설명 |
| met_value | DECIMAL(4,2) | MET 계수 |

### workout_sessions (운동 세션)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| date | DATE | 수행 날짜 |
| overall_rpe | INT | 전체 RPE (1~10) |
| memo | TEXT | 오늘의 메모/컨디션 |
| calories_burned | DECIMAL(7,2) | 총 소모 칼로리 |
| started_at | TIMESTAMP | 시작 시각 |
| finished_at | TIMESTAMP | 종료 시각 |

### workout_sets (세트별 기록)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| session_id | UUID | FK → workout_sessions |
| exercise_id | UUID | FK → exercises |
| set_number | INT | 세트 번호 |
| weight_kg | DECIMAL(5,2) | 무게 |
| reps | INT | 횟수 |
| rest_sec | INT | 다음 세트까지 휴식(초) |
| rpe | INT | 이 세트의 RPE (선택) |

### body_records (신체 기록 — 타임시리즈)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| date | DATE | 측정 날짜 |
| weight_kg | DECIMAL(5,2) | 몸무게 |
| muscle_mass_kg | DECIMAL(5,2) | 골격근량 (선택) |
| body_fat_pct | DECIMAL(4,1) | 체지방률 (선택) |

---

## 11. 화면 구조 (Screen Map)

```
[하단 탭 네비게이션]
├── 홈 (/)
│   ├── 오늘의 요약 카드
│   ├── AI 추천 루틴 (Phase 4)
│   └── 파트너 활동 (Phase 5)
│
├── 기록 (/workout)
│   ├── 운동 시작 → 세션 생성 플로우
│   ├── 최근 기록 목록
│   └── 기록 상세/편집
│
├── 캘린더 (/calendar)
│   ├── 월간 뷰 (부부 색상 구분, Phase 5)
│   └── 일별 운동 요약
│
└── 더보기 (/settings)
    ├── 라이브러리 (/library)
    │   ├── 운동 카드 목록 (필터/검색)
    │   └── 운동 상세 (영상, 설명)
    ├── 프로필 편집
    ├── 운동 목표
    ├── 장비 관리
    └── 리포트 (Phase 4)
```

---

## 12. 기술 스택 상세

### 확정

| 영역 | 기술 | 비고 |
|------|------|------|
| 프론트엔드 | React 19 + Vite + TypeScript | — |
| UI 라이브러리 | shadcn/ui (`@base-ui/react`) | Polar 디자인 시스템 기반 |
| 스타일링 | Tailwind CSS v4 | 모바일 퍼스트 |
| 라우팅 | React Router v7 | 탭 네비게이션 구조 |

### 예정 (Phase 2에서 확정)

| 영역 | 후보 | 결정 시점 |
|------|------|----------|
| 백엔드 | FastAPI (Python) | Phase 2 시작 시 |
| DB | PostgreSQL 16 | Phase 2 시작 시 |
| ORM | SQLAlchemy 2.0 | Phase 2 시작 시 |
| AI | OpenAI GPT-4o | Phase 4 시작 시 |
| 인프라 | Docker Compose | Phase 6 시작 시 |

---

## 부록: 마일스톤 체크포인트

Phase 완료 시마다 다음을 확인한다:

1. **Phase 0 완료 기준:** `npm run dev`로 빈 앱이 뜨고, shadcn/ui Button이 렌더링된다.
2. **Phase 1 완료 기준:** Mock 데이터로 모든 화면이 동작하며, 운동 기록 플로우를 처음부터 끝까지 수행할 수 있다.
3. **Phase 2 완료 기준:** API 문서(Swagger)가 생성되고, Postman/curl로 CRUD가 동작한다.
4. **Phase 3 완료 기준:** 프론트에서 실제 DB 데이터가 보이고, 운동 기록이 저장/조회된다.
5. **Phase 4 완료 기준:** AI가 오늘의 루틴을 추천하고, 주간 리포트를 생성한다.
6. **Phase 5 완료 기준:** 두 번째 사용자가 파트너의 운동 현황을 실시간으로 확인할 수 있다.
7. **Phase 6 완료 기준:** 홈랩에 배포되어 스마트폰 홈 화면에서 앱처럼 실행된다.
