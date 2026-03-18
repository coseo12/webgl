# WebGL Examples Showcase

WebGL의 기초부터 고급 시뮬레이션까지, 인터랙티브 예제로 배우는 WebGL 쇼케이스 프로젝트.

각 예제는 Canvas/Code 탭으로 실시간 렌더링 결과와 GLSL 쉐이더 소스를 함께 확인할 수 있으며, Control Panel로 파라미터를 조작해 결과를 실시간으로 변경할 수 있습니다.

**Live Demo**: [https://coseo12.github.io/webgl/](https://coseo12.github.io/webgl/)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript (strict) |
| 스타일링 | Tailwind CSS v4 |
| 테스트 | Vitest + React Testing Library |
| 배포 | GitHub Pages (정적 빌드) |

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 테스트
npm run test:run
```

## 예제 목록 (25개)

### Basic (5)

| 예제 | 설명 | 주요 개념 |
|------|------|-----------|
| 삼각형 | WebGL로 그리는 첫 번째 삼각형 | `drawArrays`, 인터리브 버퍼, varying 보간 |
| 사각형 | 두 개의 삼각형으로 사각형 그리기 | `drawElements`, 인덱스 버퍼 |
| 색상 | 버텍스 컬러를 이용한 그라데이션 | 커스텀 색상, `clearColor` 파라미터 |
| 원 | TRIANGLE_FAN으로 그리는 원과 다각형 | `TRIANGLE_FAN`, 동적 세그먼트 |
| 블렌딩 | 반투명 오브젝트 블렌드 모드 비교 | `gl.BLEND`, 일반/가산/곱셈 블렌딩 |

### Transformation (4)

| 예제 | 설명 | 주요 개념 |
|------|------|-----------|
| 이동 | 오브젝트 이동 애니메이션 | uniform, `requestAnimationFrame` |
| 회전 | 오브젝트 회전 애니메이션 | 2D 회전 행렬, cos/sin |
| 스케일 | 오브젝트 크기 변환 | uniform 스케일 |
| 복합 변환 | 이동+회전+스케일 행렬 순서 비교 | 3x3 행렬, TRS/SRT 순서 차이 |

### Lighting (4)

| 예제 | 설명 | 주요 개념 |
|------|------|-----------|
| 앰비언트 | 주변광 적용 | ambient color, intensity |
| 디퓨즈 | 확산광 적용 | Lambert 모델, 노멀 벡터, `dot(N, L)` |
| 스펙큘러 | Phong 반사 하이라이트 | `reflect()`, shininess, specular |
| 포인트 라이트 | 위치 기반 점광원 | 거리 감쇠, 마우스 광원 이동 |

### Texture (3)

| 예제 | 설명 | 주요 개념 |
|------|------|-----------|
| 기본 텍스처 | 프로시저럴 체커보드 매핑 | `texImage2D`, UV 좌표, NEAREST 필터링 |
| 멀티 텍스처 | 두 텍스처 혼합 렌더링 | `TEXTURE0`/`TEXTURE1`, `mix()` |
| 텍스처 래핑 | REPEAT/MIRRORED/CLAMP 비교 | `TEXTURE_WRAP`, UV 스케일 확장 |

### Advanced (2)

| 예제 | 설명 | 주요 개념 |
|------|------|-----------|
| 커스텀 쉐이더 | GLSL 쉐이더 프로그래밍 | `u_time`, `u_resolution`, 노이즈 |
| 파티클 | 파티클 시스템 구현 | `gl.POINTS`, 알파 블렌딩, 수명 관리 |

### Simulation (7)

| 예제 | 설명 | 주요 개념 |
|------|------|-----------|
| 솔라시스템 | 태양계 행성 공전/자전 시뮬레이션 | 구 메시, `lookAt` 궤도 카메라, 디퓨즈 라이팅 |
| 마블링 | Mathematical Marbling (Lu & Jaffe) | 핑퐁 FBO, 역변환 샘플링, Drop/Tine/Swirl |
| 낙하 모래 | 셀룰러 오토마타 모래 시뮬레이션 | CPU 시뮬레이션, `texSubImage2D`, NEAREST |
| 만델벌브 | Mandelbulb 3D 프랙탈 | 레이마칭, Distance Estimator, Orbit Trap |
| 게임 오브 라이프 | Conway's Game of Life (B3/S23) | GPU 핑퐁 FBO, Moore neighborhood |
| 플로우 필드 | Perlin Noise 벡터장 파티클 | Perlin noise, Trail FBO, 가산 블렌딩 |
| 상호 인력 | N-body 중력 시뮬레이션 | O(N²) 힘 계산, 소프트닝, 마우스 어트랙터 |

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
├── components/             # 재사용 컴포넌트
│   ├── layout/             # Header, Sidebar, AppShell
│   ├── WebGLCanvas.tsx     # WebGL 렌더링 캔버스
│   ├── ExampleViewer.tsx   # 예제 뷰어 (Canvas/Code 탭)
│   ├── CodeViewer.tsx      # 소스 코드 뷰어
│   └── ControlPanel.tsx    # 파라미터 조작 UI
└── lib/
    ├── renderers/          # 예제별 WebGL 렌더러 (25개)
    ├── webgl.ts            # WebGL 유틸리티
    ├── matrix.ts           # 4x4 행렬 연산 (perspective, lookAt, rotate 등)
    ├── params.ts           # 파라미터 타입 (slider, color, checkbox, select)
    └── examples.ts         # 예제/카테고리 정의
specs/                      # 기능 스펙 문서
docs/                       # 아키텍처/컨벤션 문서
```

## 아키텍처

### 렌더러 인터페이스

모든 WebGL 예제는 동일한 `Renderer` 인터페이스를 구현합니다:

```typescript
RendererFactory(gl, canvas) → { render(time, params), cleanup() }
```

- `render()` — rAF 루프에서 매 프레임 호출, 파라미터 변경 즉시 반영
- `cleanup()` — 언마운트 시 WebGL 리소스 해제

### 컴포넌트 흐름

```
ExamplePage (서버)
  └─ ExampleViewer (클라이언트)
       ├─ [Canvas 탭] WebGLCanvas → Renderer
       ├─ [Code 탭]   CodeViewer → sources.ts
       └─ ControlPanel → params 상태
```

### 라우팅

```
/                              → 홈 (카테고리별 예제 카드)
/examples/[category]/[slug]    → 개별 예제 (Canvas/Code 탭)
```

## 라이선스

MIT
