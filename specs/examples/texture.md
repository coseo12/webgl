# Texture 예제 스펙

## 1. 기본 텍스처 (basic-texture)

- 사각형에 체커보드 패턴 텍스처 적용
- 프로시저럴 텍스처 생성 (외부 이미지 불필요)
- 텍스처 좌표(UV) attribute 추가
- `gl.texImage2D`로 텍스처 업로드
- `gl.texParameteri`로 필터링/래핑 설정
