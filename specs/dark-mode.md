# 다크모드 스펙

## 개요

시스템 설정을 기본으로 따르되, 사용자가 수동으로 전환할 수 있는 다크/라이트 모드.

---

## 동작

### 초기 로딩

1. `localStorage`에 저장된 테마가 있으면 해당 값 사용
2. 없으면 `prefers-color-scheme` 미디어 쿼리로 시스템 설정 따름
3. **FOUC 방지**: `<head>`에 인라인 스크립트로 페이지 렌더링 전 `dark` 클래스 적용

### 토글

- Header 우측 버튼 클릭 시 light ↔ dark 전환
- 전환 시 `localStorage`에 저장
- 아이콘: 라이트 모드일 때 달(Moon), 다크 모드일 때 해(Sun) 표시

### 시스템 변경 감지

- `system` 모드일 때 OS 테마 변경 시 자동 반영
- 사용자가 수동 전환한 경우 시스템 변경 무시

---

## 구현 방식

- Tailwind CSS `dark:` variant 활용
- `<html>` 요소에 `dark` 클래스 토글
- `globals.css`에 `@custom-variant dark (&:where(.dark, .dark *))` 설정

---

## 상태

- [x] ThemeToggle 컴포넌트
- [x] theme.ts 유틸리티
- [x] 시스템 변경 감지
- [x] localStorage 저장
- [x] FOUC 방지 인라인 스크립트
