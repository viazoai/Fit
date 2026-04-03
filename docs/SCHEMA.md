# Fit — DB 스키마 설계

> 노션 마이그레이션 데이터 분석(2026-04-03) 결과를 반영한 Phase 2 스키마 계획서.  
> 핵심 원칙: **운동 타입별로 측정 방식이 다르다** — 세트/무게로 정량화할 수 없는 운동을 별도 처리.

---

## 1. 운동 타입 체계

### 타입 정의

| type | 설명 | 주요 측정 필드 |
|------|------|----------------|
| `기구` | 기구 운동 | sets, reps, weight_kg |
| `맨몸` | 맨몸 운동 (보조 기구 포함) | sets, reps, (is_assisted, assist_weight_kg) |
| `유산소` | 유산소 운동 | duration_min, distance_km, speed_kmh, incline_pct, environment |
| `스트레칭` | 스트레칭/쿨다운 | duration_min (선택) 또는 완료 체크만 |

### bodyweight 상세 — 풀업 케이스

풀업처럼 맨몸이지만 어시스트 기구(중력 보조)를 쓰는 경우를 구분:

| 케이스 | is_assisted | assist_weight_kg | 실제 부하 |
|--------|-------------|------------------|-----------|
| 맨몸 풀업 | false | null | 체중 전체 |
| 어시스트 머신 풀업 | true | 30 | 체중 - 30kg |

> `assist_weight_kg`는 기구가 **보조해주는 무게**(양수)로 입력.

### cardio 상세 — 걷기/달리기 환경 구분

같은 "걷기"도 환경에 따라 기록 방식이 달라지므로 로그 레벨에서 `environment`로 구분:

| environment | 설명 | 추가 기록 |
|-------------|------|-----------|
| `outdoor` | 산책, 야외 달리기, 하이킹 | distance_km |
| `treadmill` | 러닝머신 | speed_kmh, incline_pct, duration_min |
| `machine` | 스텝밀, 실내 자전거 등 | duration_min |
| `cycling` | 실외 라이딩 | duration_min, distance_km |

---

## 2. 근육군 체계

**주동근만 태깅**하는 방식. 협동근은 기록하지 않음(단순화).

| muscle_group | 해당 운동 예시 |
|--------------|----------------|
| `가슴` | 벤치프레스, 체스트프레스, 버터플라이 |
| `등` | 렛풀다운, 풀업, 덤벨로우, 바벨로우, 데드리프트 |
| `어깨` | 숄더프레스, 사이드래터럴레이즈, 프론트레이즈, 밀리터리프레스 |
| `하체` | 레그프레스, 레그익스텐션, 레그컬, 스쿼트 |
| `코어` | 레그레이즈, 플랭크, 크런치 |
| `이두` | 바벨컬, 덤벨컬, 해머컬 |
| `삼두` | 트라이셉스 익스텐션, 케이블 푸시다운, 딥스 |
| `전신` | 데드리프트 등 복합 운동 |
| `없음` | 유산소, 스트레칭 |

---

## 3. 테이블 정의

### users

```sql
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);
```

### exercises (운동 종목 마스터)

```sql
CREATE TABLE exercises (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    type            TEXT NOT NULL CHECK (type IN ('기구', '맨몸', '유산소', '스트레칭')),
    muscle_group    TEXT CHECK (muscle_group IN (
                        '가슴', '등', '어깨', '하체', '코어',
                        '이두', '삼두', '전신', '없음'
                    )),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

### workout_sessions (하루 운동 세션)

```sql
CREATE TABLE workout_sessions (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id),
    date        DATE NOT NULL,
    memo        TEXT,       -- 예: "헬스 (하체, 가슴, 어깨)" — 자유 메모
    kcal        INT,
    created_at  TIMESTAMPTZ DEFAULT now()
    -- 하루 2회 이상 세션 허용 (아침 헬스 + 저녁 산책 등 별도 Workout으로 관리)
);
```

### exercise_logs (세션 내 운동 종목 단위 묶음)

1행 = 운동 1종목의 전체 기록 묶음. 세트별 세부 기록은 `exercise_sets`에 저장.

```sql
CREATE TABLE exercise_logs (
    id              SERIAL PRIMARY KEY,
    session_id      INT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id     INT NOT NULL REFERENCES exercises(id),
    order_index     SMALLINT,               -- 세션 내 운동 순서

    -- [cardio 전용 — 세트 개념 없는 운동]
    duration_min    NUMERIC(5,1),
    distance_km     NUMERIC(6,3),
    speed_kmh       NUMERIC(4,1),           -- 러닝머신 속도
    incline_pct     NUMERIC(4,1),           -- 러닝머신 경사도 (%)
    environment     TEXT CHECK (environment IN ('outdoor', 'treadmill', 'machine', 'cycling')),

    -- [flexibility 전용]
    -- duration_min 공유 사용

    -- [공통]
    memo            TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

### exercise_sets (세트별 상세 기록)

`strength` / `bodyweight` 타입의 세트별 무게·횟수 기록. 1행 = 1세트.

```sql
CREATE TABLE exercise_sets (
    id               SERIAL PRIMARY KEY,
    exercise_log_id  INT NOT NULL REFERENCES exercise_logs(id) ON DELETE CASCADE,
    set_index        SMALLINT NOT NULL,     -- 세트 번호 (1, 2, 3 ...)

    -- [strength / bodyweight 공통]
    reps             SMALLINT,
    weight_kg        NUMERIC(5,2),         -- strength: 사용 무게 / bodyweight: null

    -- [bodyweight 전용]
    is_assisted      BOOLEAN DEFAULT false,
    assist_weight_kg NUMERIC(5,2),         -- 기구 보조 무게 (양수 입력, 실제 부하 = 체중 - 이 값)

    memo             TEXT,                 -- 예: "힘듦", "실패"
    created_at       TIMESTAMPTZ DEFAULT now()
);
```

> **노션 데이터 마이그레이션 시 처리**: 노션은 1행 = N세트 구조였으므로,  
> `sets=4, reps=10` → `exercise_sets`에 4개 행(set_index 1~4, reps=10)으로 분리 삽입.

---

## 4. 노션 데이터 → 새 스키마 매핑

| 노션 필드 | 새 스키마 | 비고 |
|-----------|----------|------|
| `Workout Log.Date` | `workout_sessions.date` | |
| `Workout Log.Name` | `workout_sessions.memo` | 자유 텍스트 유지 |
| `Workout Log.Kcal` | `workout_sessions.kcal` | 61건 null → 허용 |
| `Exercise.Exercise` | `exercises.name` | 표준화 필요 (아래 참조) |
| `Exercise.Category` | `exercises.type` | 재매핑 필요 |
| `Exercise.Muscle` | `exercises.muscle_group` | 주동근만 단일값으로 |
| `Exercise.Sets` + `Exercise.Repeat` + `Exercise.Weight(kg)` | `exercise_sets` (N행으로 분리) | sets=4 → 4개 행 생성 |
| `Exercise.Time(min)` | `exercise_logs.duration_min` | cardio/flexibility 전용 |
| (없음) | `exercise_logs.speed_kmh` | 러닝머신 신규 |
| (없음) | `exercise_logs.incline_pct` | 러닝머신 신규 |
| (없음) | `exercise_logs.environment` | 환경 구분 신규 |

---

## 5. 운동 종목 마스터 데이터 (노션 기준 정제)

노션 데이터에서 확인된 운동 종목의 표준화 매핑:

| 노션 이름 | 표준화 이름 | type | muscle_group | 비고 |
|-----------|------------|------|--------------|------|
| 걷기 | 걷기 | 유산소 | 없음 | environment로 산책/러닝머신 구분 |
| 달리기 | 달리기 | 유산소 | 없음 | |
| 하이킹 | 하이킹 | 유산소 | 없음 | |
| 라이딩 | 라이딩 | 유산소 | 없음 | |
| 스텝밀 | 스텝밀 | 유산소 | 없음 | environment=machine |
| 레그프레스 | 레그프레스 | 기구 | 하체 | |
| 레그익스텐션 | 레그익스텐션 | 기구 | 하체 | |
| 레그컬 | 레그컬 | 기구 | 하체 | |
| 스쿼트 | 스쿼트 | 기구 | 하체 | |
| 렛풀다운 | 렛풀다운 | 기구 | 등 | |
| 풀업 | 풀업 | 맨몸 | 등 | is_assisted 로 구분 |
| 덤벨로우 | 덤벨로우 | 기구 | 등 | 협동근(삼두) 제거 |
| 바벨로우 | 바벨로우 | 기구 | 등 | 협동근(삼두) 제거 |
| 데드리프트 | 데드리프트 | 기구 | 전신 | |
| 벤치프레스 | 벤치프레스 | 기구 | 가슴 | |
| 체스트프레스 | 체스트프레스 | 기구 | 가슴 | |
| 버터플라이 | 버터플라이 | 기구 | 가슴 | |
| 덤벨숄더프레스 | 덤벨숄더프레스 | 기구 | 어깨 | |
| 밀리터리 프레스 | 밀리터리프레스 | 기구 | 어깨 | 띄어쓰기 통일 |
| 사이드 래터럴 레이즈 | 사이드래터럴레이즈 | 기구 | 어깨 | |
| 프론트레이즈 | 프론트레이즈 | 기구 | 어깨 | |
| 레그레이즈 | 레그레이즈 | 기구 | 코어 | |
| 플랭크 | 플랭크 | 맨몸 | 코어 | |
| 크런치 | 크런치 | 맨몸 | 코어 | |
| 스트레칭 | 스트레칭 | 스트레칭 | 없음 | 운동명이자 타입 — 그대로 유지 |

---

## 6. 체성분 테이블 (개념 설계)

> 인바디 등 측정 기기에서 수집하는 신체 측정 데이터. 운동 기록과의 직접적인 관계(FK)보다는  
> **같은 `user_id` + `date` 기준으로 연결**하는 방향으로 설계. 구체적인 활용 방식은 추후 결정.

```sql
CREATE TABLE body_compositions (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id),
    measured_at     DATE NOT NULL,

    -- 인바디 주요 항목
    weight_kg       NUMERIC(5,2),
    body_fat_pct    NUMERIC(4,2),          -- 체지방률 (%)
    muscle_mass_kg  NUMERIC(5,2),          -- 골격근량
    bmi             NUMERIC(4,2),

    -- 부위별 근육량 (인바디 세부 항목 — 추후 확장)
    -- muscle_chest_kg, muscle_back_kg, muscle_legs_kg 등

    memo            TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

**운동 기록과의 연결 관계 (예상)**

```
body_compositions ─── user_id + measured_at ───► workout_sessions (user_id + date)
```

- 특정 측정일 전후 운동 세션을 조회해 변화 추이 분석
- 부위별 근육량 컬럼이 추가될 경우, `muscle_group` 체계와 매핑 가능
- 현재 홈 화면 레이더 차트(Mock 데이터)의 실제 데이터 소스가 될 테이블

---

## 7. 미결 사항

- [ ] 체성분 부위별 근육량 컬럼 — 인바디 측정 항목 확인 후 세분화
- [ ] `workout_sessions` 세션 타입 구분 필요 여부 — 헬스/야외운동 등을 세션 레벨에서도 구분할지
- [ ] 노션 → 새 스키마 마이그레이션 스크립트 작성 (Phase 2 시작 시)
