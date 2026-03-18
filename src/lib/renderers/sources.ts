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
import { VERT as transVert, FRAG as transFrag } from "./translation";
import { VERT as rotVert, FRAG as rotFrag } from "./rotation";
import { VERT as scaleVert, FRAG as scaleFrag } from "./scale";
import { VERT as ambVert, FRAG as ambFrag } from "./ambient";
import { VERT as diffVert, FRAG as diffFrag } from "./diffuse";
import { VERT as texVert, FRAG as texFrag } from "./basicTexture";
import {
  VERT as shaderVert,
  FRAG_DEFAULT,
  FRAG_GRADIENT,
  FRAG_NOISE,
} from "./shader";
import { VERT_FINAL as partVert, FRAG_FINAL as partFrag } from "./particles";

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
  "basic-texture": {
    vertexShader: texVert,
    fragmentShaders: [{ label: "Fragment", code: texFrag }],
    description:
      "프로시저럴 체커보드 텍스처 생성 후 texImage2D로 업로드. UV 좌표로 텍스처 매핑.",
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
};

export function getExampleSource(slug: string): ExampleSource | null {
  return sources[slug] ?? null;
}
