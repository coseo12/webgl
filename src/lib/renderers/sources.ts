/**
 * 각 예제의 소스 코드 매핑 (코드 뷰어용)
 */

export interface ExampleSource {
  vertexShader: string;
  fragmentShaders: { label: string; code: string }[];
  description: string;
}

import { VERT as triVert, FRAG as triFrag } from "./triangle";
import { VERT as rectVert, FRAG as rectFrag } from "./rectangle";
import { VERT as colorsVert, FRAG as colorsFrag } from "./colors";
import { VERT as circVert, FRAG as circFrag } from "./circle";
import { VERT as blendVert, FRAG as blendFrag } from "./blending";
import { VERT as transVert, FRAG as transFrag } from "./translation";
import { VERT as rotVert, FRAG as rotFrag } from "./rotation";
import { VERT as scaleVert, FRAG as scaleFrag } from "./scale";
import { VERT as combVert, FRAG as combFrag } from "./combined";
import { VERT as ambVert, FRAG as ambFrag } from "./ambient";
import { VERT as diffVert, FRAG as diffFrag } from "./diffuse";
import { VERT as specVert, FRAG as specFrag } from "./specular";
import { VERT as plVert, FRAG as plFrag } from "./pointLight";
import { VERT as texVert, FRAG as texFrag } from "./basicTexture";
import { VERT as mtVert, FRAG as mtFrag } from "./multiTexture";
import { VERT as twVert, FRAG as twFrag } from "./textureWrapping";
import {
  VERT as shaderVert,
  FRAG_DEFAULT,
  FRAG_GRADIENT,
  FRAG_NOISE,
} from "./shader";
import { VERT_FINAL as partVert, FRAG_FINAL as partFrag } from "./particles";
import { VERT as solarVert, FRAG as solarFrag } from "./solarSystem";
import {
  VERT as marbVert,
  DROP_FRAG as marbDropFrag,
  TINE_FRAG as marbTineFrag,
  SWIRL_FRAG as marbSwirlFrag,
} from "./marbling";
import { VERT as sandVert, FRAG as sandFrag } from "./fallingSand";
import { VERT as bulbVert, FRAG as bulbFrag } from "./mandelbulb";
import { VERT as golVert, FRAG as golFrag } from "./gameOfLife";

const sources: Record<string, ExampleSource> = {
  triangle: {
    vertexShader: triVert,
    fragmentShaders: [{ label: "Fragment", code: triFrag }],
    description:
      "위치(x,y)와 색상(r,g,b)을 인터리브 버퍼로 전달. varying을 통해 프래그먼트 쉐이더로 색상 보간.",
  },
  rectangle: {
    vertexShader: rectVert,
    fragmentShaders: [{ label: "Fragment", code: rectFrag }],
    description:
      "4개 꼭짓점 + 인덱스 버퍼(ELEMENT_ARRAY_BUFFER)로 2개의 삼각형을 구성해 사각형 렌더링.",
  },
  colors: {
    vertexShader: colorsVert,
    fragmentShaders: [{ label: "Fragment", code: colorsFrag }],
    description:
      "각 꼭짓점에 커스텀 색상을 적용. Control Panel의 배경색 값을 gl.clearColor에 반영.",
  },
  circle: {
    vertexShader: circVert,
    fragmentShaders: [{ label: "Fragment", code: circFrag }],
    description:
      "TRIANGLE_FAN으로 원 렌더링. segments 슬라이더로 다각형→원 변화. HSL 기반 무지개 색상.",
  },
  blending: {
    vertexShader: blendVert,
    fragmentShaders: [{ label: "Fragment", code: blendFrag }],
    description:
      "gl.BLEND로 반투명 렌더링. 3개 원이 겹치며 블렌드 모드(일반/가산/곱셈) 비교.",
  },
  translation: {
    vertexShader: transVert,
    fragmentShaders: [{ label: "Fragment", code: transFrag }],
    description:
      "uniform u_translation으로 x,y 오프셋을 전달. sin/cos 기반 애니메이션 루프.",
  },
  rotation: {
    vertexShader: rotVert,
    fragmentShaders: [{ label: "Fragment", code: rotFrag }],
    description:
      "uniform u_angle로 회전 각도 전달. 버텍스 쉐이더에서 2D 회전 행렬 적용.",
  },
  scale: {
    vertexShader: scaleVert,
    fragmentShaders: [{ label: "Fragment", code: scaleFrag }],
    description:
      "uniform u_scale로 크기 배율 전달. 슬라이더 값에 따라 실시간 크기 변경.",
  },
  combined: {
    vertexShader: combVert,
    fragmentShaders: [{ label: "Fragment", code: combFrag }],
    description:
      "3x3 행렬로 이동+회전+스케일 복합 변환. 적용 순서(TRS/SRT 등)에 따른 결과 차이 비교.",
  },
  ambient: {
    vertexShader: ambVert,
    fragmentShaders: [{ label: "Fragment", code: ambFrag }],
    description:
      "3D 큐브에 주변광 적용. MVP 행렬로 원근 투영 + 회전. ambientColor × ambientIntensity × objectColor.",
  },
  diffuse: {
    vertexShader: diffVert,
    fragmentShaders: [{ label: "Fragment", code: diffFrag }],
    description:
      "노멀 벡터를 이용한 Lambert 확산 반사. dot(normal, lightDir)로 빛의 강도 계산.",
  },
  specular: {
    vertexShader: specVert,
    fragmentShaders: [{ label: "Fragment", code: specFrag }],
    description:
      "Phong 반사 모델: ambient + diffuse + specular. reflect()와 shininess로 광택 하이라이트.",
  },
  "point-light": {
    vertexShader: plVert,
    fragmentShaders: [{ label: "Fragment", code: plFrag }],
    description:
      "위치 기반 점광원. 거리 감쇠 1/(1+att*d²) 적용. 마우스로 광원 위치 실시간 이동.",
  },
  "basic-texture": {
    vertexShader: texVert,
    fragmentShaders: [{ label: "Fragment", code: texFrag }],
    description:
      "프로시저럴 체커보드 텍스처 생성 후 texImage2D로 업로드. UV 좌표로 텍스처 매핑.",
  },
  "multi-texture": {
    vertexShader: mtVert,
    fragmentShaders: [{ label: "Fragment", code: mtFrag }],
    description:
      "TEXTURE0/TEXTURE1 멀티 텍스처 유닛으로 체커보드+스트라이프 혼합. mix() 블렌딩.",
  },
  "texture-wrapping": {
    vertexShader: twVert,
    fragmentShaders: [{ label: "Fragment", code: twFrag }],
    description:
      "REPEAT/MIRRORED_REPEAT/CLAMP_TO_EDGE 래핑 모드 비교. UV 스케일 확장으로 차이 시각화.",
  },
  shader: {
    vertexShader: shaderVert,
    fragmentShaders: [
      { label: "기본", code: FRAG_DEFAULT },
      { label: "그라데이션", code: FRAG_GRADIENT },
      { label: "노이즈", code: FRAG_NOISE },
    ],
    description:
      "풀스크린 쿼드에 프래그먼트 쉐이더 효과 적용. u_time, u_resolution uniform 활용.",
  },
  particles: {
    vertexShader: partVert,
    fragmentShaders: [{ label: "Fragment", code: partFrag }],
    description:
      "gl.POINTS로 300개 파티클 렌더링. JS에서 위치/속도/수명 업데이트 후 버퍼 갱신. 알파 블렌딩.",
  },
  "solar-system": {
    vertexShader: solarVert,
    fragmentShaders: [{ label: "Fragment", code: solarFrag }],
    description:
      "3D 태양계 시뮬레이션. 구 메시 생성, 궤도 공전/자전, lookAt 기반 궤도 카메라, 디퓨즈 라이팅.",
  },
  marbling: {
    vertexShader: marbVert,
    fragmentShaders: [
      { label: "Drop", code: marbDropFrag },
      { label: "Tine", code: marbTineFrag },
      { label: "Swirl", code: marbSwirlFrag },
    ],
    description:
      "Lu & Jaffe의 Mathematical Marbling 기반. 핑퐁 FBO로 역변환 샘플링, Drop/Tine/Swirl 연산.",
  },
  "falling-sand": {
    vertexShader: sandVert,
    fragmentShaders: [{ label: "Fragment", code: sandFrag }],
    description:
      "셀룰러 오토마타 기반 낙하 모래. CPU 시뮬레이션 → texSubImage2D 업로드, NEAREST 필터링 픽셀 아트.",
  },
  mandelbulb: {
    vertexShader: bulbVert,
    fragmentShaders: [{ label: "Fragment", code: bulbFrag }],
    description:
      "Mandelbulb 3D 프랙탈. 구면 좌표 반복 + Distance Estimator로 레이마칭, Orbit Trap 색상 매핑.",
  },
  "game-of-life": {
    vertexShader: golVert,
    fragmentShaders: [{ label: "Simulation", code: golFrag }],
    description:
      "Conway's Game of Life (B3/S23). GPU 핑퐁 FBO에서 Moore neighborhood 8방향 이웃 합산, 규칙 적용.",
  },
};

export function getExampleSource(slug: string): ExampleSource | null {
  return sources[slug] ?? null;
}
