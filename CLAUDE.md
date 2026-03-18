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
├── app/           # Next.js App Router 페이지
├── components/    # 재사용 컴포넌트
└── lib/           # 유틸리티, 헬퍼 함수
public/            # 정적 파일
docs/              # 프로젝트 문서 (컨텍스트 분리용)
```

## 컨벤션

- 상세 컨벤션은 `@docs/` 하위 문서 참고
- `@docs/conventions.md` — 코드 컨벤션
- `@docs/testing.md` — 테스트 작성 가이드
- `@docs/architecture.md` — 아키텍처 결정 사항
