# 코드 컨벤션

## 파일/폴더 네이밍

- 컴포넌트 파일: `PascalCase.tsx` (예: `Canvas.tsx`)
- 유틸리티/훅: `camelCase.ts` (예: `useWebGL.ts`)
- 테스트 파일: `*.test.ts` 또는 `*.test.tsx` (소스 파일 옆에 배치)

## 컴포넌트

- 함수 컴포넌트 + `export default` 사용
- Props 타입은 컴포넌트 파일 내에 `interface`로 정의
- 클라이언트 컴포넌트는 파일 최상단에 `"use client"` 명시

## Import 순서

1. React / Next.js
2. 외부 라이브러리
3. `@/` 절대 경로 (내부 모듈)
4. 상대 경로
5. 스타일/에셋

## TypeScript

- `any` 사용 금지 — 불가피한 경우 `unknown` + 타입 가드 사용
- `as` 타입 단언 최소화
- 유틸리티 타입 적극 활용 (`Pick`, `Omit`, `Partial` 등)

## 스타일링

- Tailwind CSS 유틸리티 클래스 우선
- 복잡한 스타일은 Tailwind의 `@apply` 활용
