# 테스트 가이드

## 도구

- **Vitest**: 테스트 러너
- **React Testing Library**: 컴포넌트 테스트
- **@testing-library/user-event**: 사용자 인터랙션 시뮬레이션

## 테스트 파일 위치

소스 파일과 같은 디렉토리에 `*.test.ts(x)` 파일 생성:

```
src/components/
├── Canvas.tsx
└── Canvas.test.tsx
```

## 테스트 작성 원칙

- 구현 세부사항이 아닌 **사용자 행동** 기준으로 테스트
- `getByRole`, `getByText` 등 접근성 기반 쿼리 우선 사용
- 각 테스트는 독립적으로 실행 가능해야 함

## 실행

```bash
npm run test         # watch 모드
npm run test:run     # 단일 실행
npm run test:coverage # 커버리지 포함
```
