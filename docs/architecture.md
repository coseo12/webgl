# 아키텍처

## 개요

WebGL 예제 쇼케이스 프로젝트. Next.js App Router 기반으로, 다양한 WebGL 예제를 탐색하고 소스 코드를 확인할 수 있다.

## 라우팅

- Next.js App Router (`src/app/`) 기반
- 서버 컴포넌트 기본, WebGL 캔버스 등 브라우저 API가 필요한 경우 클라이언트 컴포넌트 사용

```
/                              → 홈 (카테고리별 예제 카드)
/examples/[category]/[slug]    → 개별 예제 (Canvas/Code 탭)
```

## 디렉토리 역할

| 디렉토리 | 용도 |
|---|---|
| `src/app/` | 페이지, 레이아웃, 라우트 핸들러 |
| `src/components/` | 재사용 UI 컴포넌트 |
| `src/components/layout/` | 레이아웃 셸 (Header, Sidebar, AppShell) |
| `src/lib/` | WebGL 유틸리티, 헬퍼 함수 |
| `src/lib/renderers/` | 예제별 WebGL 렌더러 |
| `public/` | 정적 에셋 |
| `specs/` | 기능 스펙 문서 |
| `docs/` | 프로젝트 문서 |

## 렌더러 구조

각 WebGL 예제는 `Renderer` 인터페이스를 따르는 팩토리 함수로 구현:

```
RendererFactory(gl, canvas) → { render(time, params), cleanup() }
```

- `render()`: rAF 루프에서 매 프레임 호출, 파라미터 변경 즉시 반영
- `cleanup()`: 언마운트 시 WebGL 리소스 해제
- 쉐이더 소스는 `export const`로 코드 뷰어에서 참조 가능

## 컴포넌트 흐름

```
ExamplePage (서버)
  └─ ExampleViewer (클라이언트)
       ├─ [Canvas 탭] WebGLCanvas → Renderer
       ├─ [Code 탭]   CodeViewer → sources.ts
       └─ ControlPanel → params 상태
```

## 상태 관리

- 서버 컴포넌트에서 가능한 한 데이터 페칭 처리
- 클라이언트 상태는 React 내장 훅(`useState`, `useRef`) 우선
- 파라미터 값은 `useState`로 관리, `useRef`로 rAF 루프에 전달
- 전역 상태 관리 라이브러리는 필요 시 도입 검토
