# Control Panel 스펙

## 개요

WebGL 예제의 인터랙티브 파라미터를 조작할 수 있는 UI 패널.

---

## 위치 및 표시 조건

- 캔버스 하단에 배치
- 파라미터가 정의된 예제에서만 표시
- 파라미터가 없는 예제에서는 렌더링하지 않음

---

## 지원 컨트롤 타입

| 타입 | 용도 | 컴포넌트 |
|---|---|---|
| `slider` | 숫자 범위 조절 (회전 각도, 크기 등) | `<input type="range">` |
| `color` | 색상 선택 | `<input type="color">` |
| `checkbox` | on/off 토글 (와이어프레임 등) | `<input type="checkbox">` |
| `select` | 옵션 선택 (쉐이더 종류 등) | `<select>` |

---

## 파라미터 정의 구조

```typescript
interface SliderParam {
  type: "slider";
  label: string;
  key: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

interface ColorParam {
  type: "color";
  label: string;
  key: string;
  defaultValue: string;
}

interface CheckboxParam {
  type: "checkbox";
  label: string;
  key: string;
  defaultValue: boolean;
}

interface SelectParam {
  type: "select";
  label: string;
  key: string;
  options: { label: string; value: string }[];
  defaultValue: string;
}

type Param = SliderParam | ColorParam | CheckboxParam | SelectParam;
```

---

## 기능

- **리셋 버튼**: 모든 파라미터를 기본값으로 복원
- **실시간 반영**: 값 변경 즉시 캔버스에 반영
- **값 표시**: 슬라이더 옆에 현재 값 텍스트로 표시

---

## 스타일

- 카드 형태: `rounded-xl border`
- 배경: 약간 구분되는 색상
- 그리드: 2열 레이아웃, 모바일에서 1열
