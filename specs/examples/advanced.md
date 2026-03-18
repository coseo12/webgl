# Advanced 예제 스펙

## 1. 커스텀 쉐이더 (shader)

- 풀스크린 쿼드에 프래그먼트 쉐이더 효과 적용
- Control Panel: 쉐이더 타입 선택 (default / gradient / noise)
- `u_time` uniform으로 시간 기반 애니메이션
- `u_resolution` uniform으로 해상도 전달
- 각 쉐이더 타입별 효과:
  - default: 시간에 따라 변하는 단색
  - gradient: 화면 좌표 기반 그라데이션 + 시간 애니메이션
  - noise: 심플렉스 노이즈 패턴

## 2. 파티클 (particles)

- 다수의 점(gl.POINTS)을 이용한 파티클 시스템
- 각 파티클: 위치(x,y), 속도(vx,vy), 수명(life)
- JavaScript에서 파티클 상태 업데이트 후 버퍼 갱신
- 파티클 중심에서 방사형으로 생성, 수명 종료 시 재생성
- 알파 블렌딩으로 페이드아웃 효과
