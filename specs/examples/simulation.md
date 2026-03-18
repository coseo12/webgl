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
