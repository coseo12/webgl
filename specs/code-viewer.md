# 코드 뷰어 스펙

## 개요

각 WebGL 예제의 소스 코드(쉐이더 + 렌더러 로직)를 UI에서 확인할 수 있는 기능.

---

## UI 구조

### 탭 전환

예제 페이지 상단에 2개 탭:

```
[ Canvas ]  [ Code ]
```

- **Canvas**: WebGL 렌더링 결과 (기본 선택)
- **Code**: 소스 코드 뷰어

### 코드 뷰어 내부 탭

코드 뷰어 내에서 쉐이더 종류별 서브탭:

```
[ Vertex Shader ]  [ Fragment Shader ]  [ JavaScript ]
```

---

## 코드 표시

- `<pre><code>` 기반 고정 폭 글꼴
- 줄 번호 표시
- 다크/라이트 모드 대응
- 복사 버튼 (클립보드 복사)
- 스크롤 가능한 영역 (max-height 제한)

---

## 소스 코드 매핑

각 렌더러 파일에서 쉐이더 소스를 export하고, `sources.ts`에서 slug별로 매핑:

```typescript
interface ExampleSource {
  vertexShader: string;
  fragmentShader: string | Record<string, string>;  // 쉐이더 예제는 여러 개
  description: string;
}
```

---

## 기능 요구사항

- [x] Canvas ↔ Code 탭 전환
- [x] Vertex / Fragment / JS 서브탭
- [x] 줄 번호 표시
- [x] 클립보드 복사 버튼
- [x] 다크모드 대응
