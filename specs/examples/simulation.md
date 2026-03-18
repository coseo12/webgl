# Simulation 예제 스펙

## 1. 솔라시스템 (solar-system)

3D 태양계 시뮬레이션. 태양을 중심으로 행성들이 공전하며, 사용자가 카메라 시점을 자유롭게 제어할 수 있다.

### 천체 구성

- **태양**: 중심(0,0,0), 자체 발광(노란색), 자전
- **수성**: 공전 반경 3, 크기 0.2, 빠른 공전
- **금성**: 공전 반경 4.5, 크기 0.35
- **지구**: 공전 반경 6, 크기 0.4, 자전 + 공전
- **화성**: 공전 반경 8, 크기 0.3

### 렌더링

- 구(sphere) 메시 생성: 경도/위도 분할(segments)로 삼각형 구성
- 각 천체별 고유 색상 (vertex color 또는 uniform)
- 디퓨즈 라이팅: 태양 위치를 광원으로 사용
- 태양은 라이팅 미적용 (자체 발광 효과)

### 움직임

- 각 행성은 고유 공전 속도로 태양 주위 공전 (Y축 기준 회전)
- 지구는 자전도 표현 (자체 Y축 회전)
- `u_time` 기반 애니메이션, `requestAnimationFrame` 루프

### 시점 제어 (카메라)

- **궤도 카메라(Orbit Camera)** 방식
  - 마우스 드래그: 카메라 회전 (azimuth / elevation)
  - 마우스 휠: 줌 인/아웃 (카메라 거리 조절)
- lookAt 행렬로 뷰 매트릭스 생성
- perspective 프로젝션 적용

### Control Panel 파라미터

| key | type | label | 설정 |
|-----|------|-------|------|
| `speed` | slider | 공전 속도 | min: 0, max: 5, step: 0.1, default: 1 |
| `showOrbits` | checkbox | 궤도 표시 | default: true |
| `autoRotate` | checkbox | 자동 회전 | default: false |

### 필요한 행렬 함수 추가 (matrix.ts)

- `lookAt(eye, center, up)` — 뷰 매트릭스 생성
- `rotateZ(m, angle)` — Z축 회전 (궤도 경사 등)
- `scale(m, x, y, z)` — 균일/비균일 스케일링

### 쉐이더

**버텍스 쉐이더:**
- attributes: `a_position`, `a_normal`
- uniforms: `u_model`, `u_view`, `u_projection`, `u_normalMatrix`
- varying: `v_normal`, `v_position`

**프래그먼트 쉐이더:**
- uniforms: `u_color`, `u_lightPosition`, `u_emissive`
- 디퓨즈 라이팅 계산 (u_emissive=true인 태양은 풀 브라이트)

### 궤도 라인

- `showOrbits=true` 시 각 행성의 공전 궤도를 원형 라인(gl.LINE_LOOP)으로 표시
- 반투명 회색

---

## 2. 마블링 (marbling)

Mathematical Marbling (Lu & Jaffe) 논문 기반 유체 마블링 시뮬레이션.
잉크를 떨어뜨리고, 빗(tine)으로 끌거나 소용돌이를 만들어 마블 패턴을 생성한다.

### 수학적 기반 — Lu & Jaffe, "Mathematical Marbling"

모든 연산은 2D 좌표 변환으로 표현. 현재 색상 필드를 텍스처로 저장하고,
각 연산의 **역변환(inverse mapping)** 으로 새 텍스처를 샘플링해 결과를 생성한다.

#### Drop (잉크 드롭)

중심 c, 반지름 r인 원형 잉크를 떨어뜨린다.
기존 점 p는 `p' = c + sqrt(|p-c|² + r²) * (p-c)/|p-c|` 로 밀려남.
역변환: `p_orig = c + sqrt(|p'−c|² − r²) * (p'−c)/|p'−c|` (|p'−c| > r일 때)
|p'−c| ≤ r인 영역은 새 잉크 색상으로 채움.

#### Tine (빗 끌기)

선분 A→B 방향으로 유체를 끌어당긴다.
수직 거리 d에 따른 Lorentzian 감쇠: `falloff = σ² / (d² + σ²)`
변위 = `(B−A) * strength * falloff`
역변환: `p_orig = p − displacement`

#### Swirl (소용돌이)

중심 c, 반경 R 내부의 점들을 회전시킨다.
거리 d에 따른 이차 감쇠: `angle = θ * (1 − d/R)²`
역변환: `p_orig = rotate(p − c, −angle) + c`

### 렌더링 구조

- **핑퐁 프레임버퍼**: 두 개의 RGBA 텍스처 + 프레임버퍼 교대 사용
- 각 연산마다: 이전 텍스처 읽기 → 역변환 샘플링 → 다음 텍스처에 쓰기 → 스왑
- 최종 결과를 화면에 블릿(blit)

### 쉐이더 구성

**공유 버텍스 쉐이더:**
- 풀스크린 쿼드 (clip space → UV 매핑)

**프래그먼트 쉐이더 (연산별):**
- Drop: `u_center`, `u_radius`, `u_inkColor`, `u_aspect`
- Tine: `u_start`, `u_end`, `u_strength`, `u_width`, `u_aspect`
- Swirl: `u_center`, `u_radius`, `u_angle`, `u_aspect`
- Display: 텍스처 단순 출력

### 사용자 인터랙션

- **드롭**: 캔버스 클릭 → 클릭 위치에 잉크 드롭
- **빗(Tine)**: 캔버스 드래그 → 드래그 경로를 따라 유체 변형
- **소용돌이**: 캔버스 클릭 후 홀드 → 매 프레임 소용돌이 적용

### Control Panel 파라미터

| key | type | label | 설정 |
|-----|------|-------|------|
| `tool` | select | 도구 | 잉크 드롭 / 빗(Tine) / 소용돌이 |
| `inkColor` | color | 잉크 색상 | default: #E63946 |
| `radius` | slider | 반지름 | min: 0.02, max: 0.2, step: 0.01, default: 0.08 |
| `strength` | slider | 강도 | min: 1, max: 10, step: 0.5, default: 3 |

---

## 3. 낙하 모래 (falling-sand)

셀룰러 오토마타 기반 낙하 모래 시뮬레이션.
마우스로 다양한 색상의 모래를 뿌리면 중력에 의해 떨어지며 쌓인다.

### 시뮬레이션 규칙

- **그리드**: 캔버스 크기 기반 (셀 크기 4px), 각 셀은 비어있거나 모래 입자
- **업데이트 순서**: 하단→상단 순회 (하단 입자 먼저 정착, 자연스러운 낙하 캐스케이드)
- **좌우 편향 방지**: 매 프레임 순회 방향(좌→우 / 우→좌) 교대
- 각 모래 입자 이동 규칙:
  1. 아래 셀이 비어있으면 → 아래로 이동
  2. 아래-좌 또는 아래-우 중 비어있으면 → 대각선 이동 (랜덤 우선 방향)
  3. 모두 막혀있으면 → 정지

### 렌더링

- **CPU 시뮬레이션**: JavaScript에서 그리드 상태 업데이트
- 매 프레임 RGBA 픽셀 버퍼를 `texSubImage2D`로 GPU에 업로드
- `gl.NEAREST` 필터링으로 픽셀 아트 느낌
- 배경색: 어두운 네이비 (13, 13, 26)
- 모래 입자별 미세 밝기 변동(±15)으로 자연스러운 질감

### 인터랙션

- 마우스 클릭/드래그: 현재 색상의 모래를 브러시 범위 내에 확률적으로 배치 (60%)
- 브러시: 원형, 반지름 조절 가능

### 쉐이더

- 버텍스: 풀스크린 쿼드, Y축 반전 (그리드 row 0 = 화면 상단)
- 프래그먼트: 텍스처 단순 출력 (NEAREST 필터링)

### Control Panel 파라미터

| key | type | label | 설정 |
|-----|------|-------|------|
| `sandColor` | color | 모래 색상 | default: #E8A530 |
| `brushSize` | slider | 브러시 크기 | min: 1, max: 10, step: 1, default: 3 |
| `speed` | slider | 시뮬레이션 속도 | min: 1, max: 5, step: 1, default: 2 |
| `rainbow` | checkbox | 무지개 모드 | default: false |

---

## 4. 만델벌브 (mandelbulb)

Mandelbulb 3D 프랙탈을 레이마칭(ray marching)으로 렌더링.
Power 값 조절로 프랙탈 형태 변화, 궤도 카메라로 시점 제어, 다양한 색상 테마 지원.

### 수학적 기반

3D 만델브로 확장. 구면 좌표계에서 반복:

```
z_{n+1} = z_n^power + c
```

구면 좌표 변환:
- `r = |z|, θ = acos(z.z/r), φ = atan(z.y, z.x)`
- `z^p = r^p * (sin(pθ)cos(pφ), sin(pθ)sin(pφ), cos(pθ))`

**Distance Estimator (DE):**
- 도함수 추적: `dr = power * r^(power-1) * dr + 1`
- 거리 추정: `DE = 0.5 * ln(r) * r / dr`

### 렌더링 구조

- **레이마칭**: 카메라에서 픽셀별 레이를 쏘고, DE로 거리 추정하며 전진
- **노멀 계산**: 중심차분법으로 DE의 그래디언트 → 노멀 벡터
- **Orbit Trap**: 반복 중 최소 반경을 추적해 색상 매핑에 활용
- **AO**: 레이마칭 스텝 수 기반 앰비언트 오클루전

### 쉐이더

**버텍스**: 풀스크린 쿼드 (gl_FragCoord 활용)

**프래그먼트 (핵심):**
- uniforms: `u_resolution`, `u_cameraPos`, `u_power`, `u_iterations`, `u_colorScheme`
- `mandelbulbDE(pos)` — 거리 추정 함수
- `mandelbulbTrap(pos)` — orbit trap 값 계산
- `rayMarch(ro, rd)` — 레이마칭 루프 (MAX_STEPS=80)
- `getNormal(p)` — 중심차분 노멀
- 라이팅: diffuse + specular + AO
- 색상 테마: 클래식/웜톤/쿨톤/사이키델릭

### 인터랙션

- 마우스 드래그: 궤도 카메라 회전 (azimuth / elevation)
- 마우스 휠: 줌 인/아웃

### Control Panel 파라미터

| key | type | label | 설정 |
|-----|------|-------|------|
| `power` | slider | Power | min: 2, max: 12, step: 0.5, default: 8 |
| `iterations` | slider | 반복 횟수 | min: 4, max: 16, step: 1, default: 8 |
| `colorScheme` | select | 색상 테마 | 클래식/웜톤/쿨톤/사이키델릭, default: classic |
| `autoRotate` | checkbox | 자동 회전 | default: true |

---

## 5. 게임 오브 라이프 (game-of-life)

Conway's Game of Life — 2차원 셀룰러 오토마톤.
간단한 규칙으로 복잡한 패턴이 창발하는 대표적 시뮬레이션.

### 규칙 (B3/S23)

무한 2차원 그리드, 각 셀은 alive(1) 또는 dead(0).
매 세대 동시 업데이트 (Moore neighborhood — 8방향 이웃):

1. **탄생(Birth)**: dead 셀의 alive 이웃이 **정확히 3개**면 → alive
2. **생존(Survival)**: alive 셀의 alive 이웃이 **2개 또는 3개**면 → alive 유지
3. **죽음**: 그 외 모든 alive 셀 → dead (과소/과밀)

### 초기 패턴 프리셋

- **Random**: 랜덤 30% 채움
- **Glider**: 이동하는 최소 패턴 `[(1,0),(2,1),(0,2),(1,2),(2,2)]`
- **Glider Gun (Gosper)**: 주기적으로 글라이더를 생성하는 패턴
- **Pulsar**: 주기 3 오실레이터 (가장 큰 주기 3 패턴)
- **Lightweight Spaceship (LWSS)**: 수평 이동 우주선

### 렌더링

- **GPU 시뮬레이션**: 핑퐁 프레임버퍼로 셀 상태를 텍스처에 저장
  - 프래그먼트 쉐이더에서 8방향 이웃 합산 → 규칙 적용
  - texelFetch 대신 `texture2D` + 1/resolution 오프셋 사용 (WebGL1 호환)
- **NEAREST 필터링**: 픽셀 아트 느낌
- alive 셀: 밝은 색 (cyan/green 계열)
- dead 셀: 어두운 배경

### 인터랙션

- 클릭/드래그: 셀 토글 (alive ↔ dead)
- 시뮬레이션 일시정지 중에도 셀 편집 가능

### Control Panel 파라미터

| key | type | label | 설정 |
|-----|------|-------|------|
| `speed` | slider | 속도 | min: 1, max: 20, step: 1, default: 5 |
| `pattern` | select | 초기 패턴 | Random/Glider/GliderGun/Pulsar/LWSS, default: random |
| `running` | checkbox | 실행 | default: true |
