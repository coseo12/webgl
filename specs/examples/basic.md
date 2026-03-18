# Basic 예제 스펙

## 1. 삼각형 (triangle)

- 화면 중앙에 빨강/초록/파랑 버텍스 컬러의 삼각형 렌더링
- 버텍스 쉐이더: 위치 + 색상 attribute
- 프래그먼트 쉐이더: varying으로 전달받은 색상 보간 출력
- 정적 렌더링 (애니메이션 없음)

## 2. 사각형 (rectangle)

- 화면 중앙에 흰색 사각형 렌더링
- 2개의 삼각형(6개 버텍스 또는 인덱스 버퍼)으로 구성
- `gl.drawElements` + `ELEMENT_ARRAY_BUFFER` 사용
- 정적 렌더링

## 3. 색상 (colors)

- 삼각형에 각 꼭짓점별 커스텀 혼합 색상 적용
  - 꼭짓점 1: (1.0, 0.2, 0.3) — 붉은 계열
  - 꼭짓점 2: (0.3, 1.0, 0.2) — 초록 계열
  - 꼭짓점 3: (0.2, 0.3, 1.0) — 파랑 계열
- Control Panel: 배경색(bgColor) 컬러 피커
- `gl.clearColor`에 bgColor 반영
- 정적 렌더링 (파라미터 변경 시 다시 그리기)

## 4. 원 (circle)

- `gl.TRIANGLE_FAN`으로 원 그리기
- 중심점 + 둘레 버텍스로 부채꼴 삼각형 구성
- segments 슬라이더로 다각형(3)→원(64) 변화를 실시간 확인
- 무지개 색상: 둘레 버텍스에 HSL 기반 색상 할당
- Control Panel: `segments` (slider, 3~64, default 32)

## 5. 블렌딩 (blending)

- `gl.enable(gl.BLEND)` + `gl.blendFunc`를 사용한 반투명 렌더링
- 빨강/초록/파랑 반투명 원 3개가 벤 다이어그램 형태로 겹침
- 블렌드 모드에 따른 혼합 결과 차이를 시각적으로 비교
- 블렌드 모드:
  - 일반: `SRC_ALPHA, ONE_MINUS_SRC_ALPHA`
  - 가산: `SRC_ALPHA, ONE`
  - 곱셈: `DST_COLOR, ZERO`
- Control Panel: `alpha` (slider, 0.1~1.0, default 0.5), `blendMode` (select: normal/additive/multiply)
