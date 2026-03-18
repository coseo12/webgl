# WebGL 프로젝트

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript (strict)
- **스타일링**: Tailwind CSS v4
- **테스트**: Vitest + React Testing Library
- **린트**: ESLint (eslint-config-next)

## 주요 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 실행
npm run test         # Vitest watch 모드
npm run test:run     # Vitest 단일 실행
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
├── components/             # 재사용 컴포넌트
│   ├── layout/             # Header, Sidebar, AppShell 등
│   ├── icons/              # SVG 아이콘 컴포넌트
│   ├── WebGLCanvas.tsx     # WebGL 렌더링 캔버스
│   ├── ExampleViewer.tsx   # 예제 뷰어 (Canvas/Code 탭 전환)
│   ├── CodeViewer.tsx      # 소스 코드 뷰어
│   └── ControlPanel.tsx    # 파라미터 조작 UI
└── lib/
    ├── renderers/          # 예제별 WebGL 렌더러
    ├── webgl.ts            # WebGL 공통 유틸리티
    ├── matrix.ts           # 4x4 행렬 연산
    ├── params.ts           # 파라미터 타입 정의
    ├── examples.ts         # 예제 데이터/카테고리
    └── theme.ts            # 다크모드 유틸리티
specs/                      # 기능 스펙 문서
docs/                       # 프로젝트 문서 (컨텍스트 분리용)
```

## 컨벤션

- 상세 컨벤션은 `@docs/` 하위 문서 참고
- `@docs/conventions.md` — 코드 컨벤션
- `@docs/testing.md` — 테스트 작성 가이드
- `@docs/architecture.md` — 아키텍처 결정 사항

## 스펙 문서

- `@specs/layout.md` — 전체 레이아웃 구조
- `@specs/dark-mode.md` — 다크모드 동작
- `@specs/responsive.md` — 반응형 브레이크포인트
- `@specs/control-panel.md` — 파라미터 컨트롤 패널
- `@specs/code-viewer.md` — 소스 코드 뷰어
- `@specs/examples/` — 예제별 상세 스펙
