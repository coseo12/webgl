# Lighting 예제 스펙

## 1. 앰비언트 (ambient)

- 3D 큐브에 주변광(Ambient Light) 적용
- uniform `u_ambientColor`, `u_ambientIntensity`
- 오브젝트 색상 × 앰비언트 색상 × 강도 = 최종 색상
- 큐브 자동 회전으로 3D 느낌 제공

## 2. 디퓨즈 (diffuse)

- 3D 큐브에 확산광(Diffuse Light) 적용
- 노멀 벡터 attribute 추가
- uniform `u_lightDirection`, `u_lightColor`
- Lambert 반사 모델: max(dot(normal, lightDir), 0.0)
- 큐브 자동 회전
