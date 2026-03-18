# Texture 예제 스펙

## 1. 기본 텍스처 (basic-texture)

- 사각형에 체커보드 패턴 텍스처 적용
- 프로시저럴 텍스처 생성 (외부 이미지 불필요)
  - 8×8 픽셀 체커보드
  - 밝은 칸: RGB(240, 240, 240), 어두운 칸: RGB(40, 40, 40)
- 텍스처 좌표(UV) attribute 추가
- `gl.texImage2D`로 텍스처 업로드
- 필터링: `NEAREST` (민/맥), 래핑: `REPEAT` (S/T)
- 배경색: 어두운 회색 (0.1, 0.1, 0.1)

## 2. 멀티 텍스처 (multi-texture)

- 두 개의 프로시저럴 텍스처를 혼합 렌더링
  - 텍스처 A: 체커보드 (8×8)
  - 텍스처 B: 스트라이프 (8×8, 세로줄)
- `gl.TEXTURE0`, `gl.TEXTURE1` 멀티 텍스처 유닛 사용
- 프래그먼트 쉐이더에서 `mix(texA, texB, ratio)` 블렌딩
- Control Panel: `mixRatio` (slider, 0~1, default 0.5)

## 3. 텍스처 래핑 (texture-wrapping)

- UV 범위를 [0, uvScale]로 확장해 래핑 모드 차이를 시각화
- 래핑 모드별 비교:
  - `REPEAT`: 패턴 반복
  - `MIRRORED_REPEAT`: 거울 반사 반복
  - `CLAMP_TO_EDGE`: 가장자리 색상 고정
- 프로시저럴 그라데이션 텍스처 사용 (래핑 차이가 잘 보이도록)
- Control Panel:
  - `wrapMode` (select: repeat/mirrored/clamp)
  - `uvScale` (slider, 1~5, step 0.5, default 2)
