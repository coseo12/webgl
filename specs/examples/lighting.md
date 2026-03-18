# Lighting 예제 스펙

## 1. 앰비언트 (ambient)

- 3D 큐브에 주변광(Ambient Light) 적용
- uniform `u_ambientColor`, `u_ambientIntensity`
- 오브젝트 색상 × 앰비언트 색상 × 강도 = 최종 색상
- 큐브 자동 회전으로 3D 느낌 제공

## 2. 디퓨즈 (diffuse)

- 3D 큐브에 확산광(Diffuse Light) 적용
- 노멀 벡터 attribute 추가
- uniform `u_lightDir`, `u_lightColor`
- Lambert 반사 모델: max(dot(normal, lightDir), 0.0)
- 암비언트 성분(0.15) 추가로 그림자 부분도 최소 밝기 유지
- 큐브 자동 회전

## 3. 스펙큘러 (specular)

- Phong 반사 모델: ambient + diffuse + **specular** 하이라이트
- `reflect(-lightDir, normal)` + `pow(dot(R, viewDir), shininess)`
- 큐브 자동 회전, 카메라 위치 고정 (z=-3)
- Control Panel:
  - `shininess` (slider, 2~128, default 32) — 광택 집중도
  - `specularIntensity` (slider, 0~1, default 0.5) — 하이라이트 강도

## 4. 포인트 라이트 (point-light)

- 위치 기반 광원 (방향광이 아닌 점광원)
- 거리 감쇠(attenuation): `1.0 / (1.0 + att * d²)` (d = 광원~표면 거리)
- 마우스 드래그로 광원 위치를 XY 평면에서 실시간 이동
- ambient + diffuse + 감쇠 결합
- Control Panel:
  - `lightColor` (color, default #FFFFFF)
  - `attenuation` (slider, 0.5~3.0, default 1.0) — 감쇠 계수
