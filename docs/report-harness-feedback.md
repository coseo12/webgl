# Harness-Setting 피드백 리포트

> 작성일: 2026-04-04
> 작업 맥락: WebGL 프로젝트 P0~P2 개선 작업 수행 중 발견한 하네스 프레임워크 이슈

---

## 1. 에이전트 정의 파일 불일치

**현상**: `.harness/state.json`에 10개+ 에이전트 슬롯이 정의되어 있으나, 실제 `.claude/agents/`에는 `developer.md`만 존재.

**영향**: state.json의 orchestrator, planner, pm, architect, reviewer, qa, auditor, integrator 슬롯이 모두 빈 상태. 실제 운영과 괴리.

**제안**: 
- 사용하지 않는 에이전트 슬롯을 state.json에서 제거
- 또는 최소한 `auditor.md` (코드 리뷰 + QA 통합) 추가

---

## 2. CI 파이프라인에 빌드 검증 없음

**현상**: `.github/workflows/ci.yml`이 테스트만 실행하고 `npm run build`를 포함하지 않음.

**영향**: 이번 작업에서 TypeScript 컴파일 에러(`onFullscreenChange` 미지원)가 빌드 시에만 발견됨. CI가 이를 감지하지 못함.

**제안**: ci.yml에 빌드 단계 추가
```yaml
- run: npm run build
```

---

## 3. lint 스크립트 미작동

**현상**: `npm run lint` → `next lint`가 디렉토리 오류로 실패. ESLint 설정이 불완전.

**영향**: 코드 품질 검증 자동화 불가.

**제안**: ESLint 설정 점검 및 ci.yml에 lint 단계 추가

---

## 4. CLAUDE.md 프로젝트 구조 업데이트 필요

**현상**: harness init으로 CLAUDE.md가 범용 워크플로우 템플릿으로 교체됨. 기존 프로젝트 구조 설명(src/, components/, lib/ 등)이 삭제됨.

**영향**: Claude가 프로젝트 구조를 파악하려면 매번 파일 탐색 필요.

**제안**: CLAUDE.md에 프로젝트별 구조 섹션을 추가하거나, 별도 `docs/project-structure.md`로 분리

---

## 5. developer.md 브라우저 검증이 WebGL에 부적합

**현상**: developer.md의 3레벨 브라우저 검증은 DOM 기반 UI를 전제로 함. Canvas 내부 WebGL 렌더링은 검증 범위 밖.

**영향**: WebGL 렌더링 정확성(셰이더 컴파일 성공, gl.getError() === 0)을 검증하는 체크리스트 없음.

**제안**: developer.md에 WebGL 전용 검증 체크리스트 추가
```
## WebGL 검증 (Canvas 프로젝트)
- [ ] gl.getShaderInfoLog() 에러 없음
- [ ] gl.getError() === gl.NO_ERROR
- [ ] cleanup()에서 모든 WebGL 리소스 해제
- [ ] resizeCanvas() DPR 대응
```

---

## 6. 스킬 라벨에 도메인 라벨 부재

**현상**: `create-issue` 스킬의 라벨 체계에 `scope:frontend`, `scope:backend`, `scope:fullstack`만 있음.

**영향**: WebGL/셰이더 관련 이슈를 분류할 라벨 없음.

**제안**: `scope:webgl`, `scope:shader` 도메인 라벨 추가

---

## 요약

| # | 항목 | 심각도 | 난이도 |
|---|------|--------|--------|
| 1 | state.json 에이전트 슬롯 정리 | 낮음 | 낮음 |
| 2 | CI에 빌드 검증 추가 | **높음** | 낮음 |
| 3 | lint 스크립트 수정 | 중간 | 낮음 |
| 4 | CLAUDE.md 프로젝트 구조 추가 | 중간 | 낮음 |
| 5 | WebGL 검증 체크리스트 | 중간 | 낮음 |
| 6 | 도메인 라벨 추가 | 낮음 | 낮음 |
