# 아키텍처

## 개요

WebGL 기반 프로젝트로, Next.js App Router를 사용한다.

## 라우팅

- Next.js App Router (`src/app/`) 기반
- 서버 컴포넌트 기본, WebGL 캔버스 등 브라우저 API가 필요한 경우 클라이언트 컴포넌트 사용

## 디렉토리 역할

| 디렉토리 | 용도 |
|---|---|
| `src/app/` | 페이지, 레이아웃, 라우트 핸들러 |
| `src/components/` | 재사용 UI 컴포넌트 |
| `src/lib/` | WebGL 유틸리티, 헬퍼 함수 |
| `public/` | 정적 에셋 (셰이더, 텍스처 등) |
| `docs/` | 프로젝트 문서 |

## 상태 관리

- 서버 컴포넌트에서 가능한 한 데이터 페칭 처리
- 클라이언트 상태는 React 내장 훅(`useState`, `useReducer`) 우선
- 전역 상태 관리 라이브러리는 필요 시 도입 검토
