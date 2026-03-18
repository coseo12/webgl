# Transformation 예제 스펙

## 1. 이동 (translation)

- 삼각형이 좌우로 반복 이동하는 애니메이션
- uniform `u_translation`으로 x, y 오프셋 전달
- `requestAnimationFrame` 루프로 sin 기반 이동

## 2. 회전 (rotation)

- 삼각형이 중심축 기준으로 회전하는 애니메이션
- uniform `u_rotation` (2x2 또는 cos/sin 값) 전달
- Control Panel: 회전 속도(speed), 자동 회전(autoRotate) 토글
- autoRotate=false 시 speed 슬라이더 값이 고정 각도로 사용

## 3. 스케일 (scale)

- 삼각형 크기를 동적으로 조절
- uniform `u_scale` 전달
- Control Panel: 크기(scale) 슬라이더
- 실시간 반영

## 4. 복합 변환 (combined)

- 이동 + 회전 + 스케일을 하나의 삼각형에 동시 적용
- **행렬 적용 순서**에 따른 결과 차이를 비교 (TRS vs SRT 등)
- 2D 변환 행렬을 직접 조합: translate → rotate → scale
- Control Panel:
  - `order` (select: TRS/TSR/RTS/SRT)
  - `tx` (slider, -0.5~0.5) — X 이동량
  - `ty` (slider, -0.5~0.5) — Y 이동량
  - `angle` (slider, 0~360) — 회전 각도(도)
  - `scale` (slider, 0.3~2.0) — 크기 배율
