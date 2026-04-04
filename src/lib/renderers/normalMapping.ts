/**
 * Normal Mapping — 프로시저럴 노멀맵으로 표면 디테일 표현
 * 교육 포인트: 탄젠트 공간, TBN 행렬, 노멀맵 텍스처 활용
 */

import { type Renderer } from "./types";
import { type ParamValues } from "@/lib/params";
import { createProgram, resizeCanvas, hexToRgb } from "@/lib/webgl";
import { identity, perspective, lookAt, multiply, rotateY } from "@/lib/matrix";

export const VERT = `
attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec3 a_normal;
attribute vec3 a_tangent;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec2 v_uv;
varying vec3 v_fragPos;
varying mat3 v_tbn;

void main() {
  vec4 worldPos = u_model * vec4(a_position, 1.0);
  v_fragPos = worldPos.xyz;
  v_uv = a_uv;

  // TBN 행렬: 탄젠트 공간 → 월드 공간 변환
  vec3 T = normalize(vec3(u_model * vec4(a_tangent, 0.0)));
  vec3 N = normalize(vec3(u_model * vec4(a_normal, 0.0)));
  vec3 B = cross(N, T);
  v_tbn = mat3(T, B, N);

  gl_Position = u_projection * u_view * worldPos;
}`;

export const FRAG = `
precision mediump float;

uniform vec3 u_lightPos;
uniform vec3 u_viewPos;
uniform vec3 u_lightColor;
uniform float u_bumpStrength;
uniform sampler2D u_normalMap;

varying vec2 v_uv;
varying vec3 v_fragPos;
varying mat3 v_tbn;

void main() {
  // 노멀맵에서 탄젠트 공간 노멀 추출 (0~1 → -1~1)
  vec3 normalTex = texture2D(u_normalMap, v_uv * 3.0).rgb;
  normalTex = normalTex * 2.0 - 1.0;
  normalTex.xy *= u_bumpStrength;
  normalTex = normalize(normalTex);

  // 탄젠트 공간 → 월드 공간
  vec3 normal = normalize(v_tbn * normalTex);

  // Blinn-Phong 라이팅
  vec3 lightDir = normalize(u_lightPos - v_fragPos);
  vec3 viewDir = normalize(u_viewPos - v_fragPos);
  vec3 halfDir = normalize(lightDir + viewDir);

  // 벽돌 색상
  vec3 baseColor = vec3(0.72, 0.35, 0.22);

  float ambient = 0.15;
  float diff = max(dot(normal, lightDir), 0.0);
  float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);

  vec3 color = baseColor * (ambient + diff * u_lightColor) + spec * u_lightColor * 0.5;
  gl_FragColor = vec4(color, 1.0);
}`;

// 평면 메시 (position + uv + normal + tangent)
function createPlaneData(): Float32Array {
  // 4개 정점, 2개 삼각형
  const s = 2.0;
  // position(3) + uv(2) + normal(3) + tangent(3) = 11 floats per vertex
  return new Float32Array([
    // pos           uv      normal       tangent
    -s, -s, 0,   0, 0,   0, 0, 1,   1, 0, 0,
     s, -s, 0,   1, 0,   0, 0, 1,   1, 0, 0,
     s,  s, 0,   1, 1,   0, 0, 1,   1, 0, 0,
    -s, -s, 0,   0, 0,   0, 0, 1,   1, 0, 0,
     s,  s, 0,   1, 1,   0, 0, 1,   1, 0, 0,
    -s,  s, 0,   0, 1,   0, 0, 1,   1, 0, 0,
  ]);
}

// 프로시저럴 벽돌 노멀맵 생성
function createBrickNormalMap(): Uint8Array {
  const SIZE = 256;
  const data = new Uint8Array(SIZE * SIZE * 4);

  const BRICK_W = 64;
  const BRICK_H = 32;
  const MORTAR = 4; // 줄눈 두께

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;

      // 짝수/홀수 행에 따른 벽돌 오프셋
      const row = Math.floor(y / BRICK_H);
      const offsetX = (row % 2 === 0) ? 0 : BRICK_W / 2;
      const bx = (x + offsetX) % BRICK_W;
      const by = y % BRICK_H;

      // 줄눈 여부 판정
      const isMortarX = bx < MORTAR;
      const isMortarY = by < MORTAR;
      const isMortar = isMortarX || isMortarY;

      if (isMortar) {
        // 줄눈: 기본 노멀 (0,0,1) → 인코딩 (128,128,255)
        data[idx] = 128;
        data[idx + 1] = 128;
        data[idx + 2] = 255;
      } else {
        // 벽돌 표면: 가장자리에서 약간의 경사
        let nx = 0;
        let ny = 0;

        // 벽돌 가장자리에서 노멀 기울기 (경사 표현)
        const EDGE = 8;
        if (bx < MORTAR + EDGE) nx = -(1 - (bx - MORTAR) / EDGE) * 0.5;
        if (bx > BRICK_W - EDGE) nx = ((bx - (BRICK_W - EDGE)) / EDGE) * 0.5;
        if (by < MORTAR + EDGE) ny = -(1 - (by - MORTAR) / EDGE) * 0.5;
        if (by > BRICK_H - EDGE) ny = ((by - (BRICK_H - EDGE)) / EDGE) * 0.5;

        // 노멀 인코딩: -1~1 → 0~255
        data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        data[idx + 2] = 255;
      }
      data[idx + 3] = 255;
    }
  }
  return data;
}

export function createNormalMappingRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);

  const aPos = gl.getAttribLocation(program, "a_position");
  const aUv = gl.getAttribLocation(program, "a_uv");
  const aNormal = gl.getAttribLocation(program, "a_normal");
  const aTangent = gl.getAttribLocation(program, "a_tangent");

  const uModel = gl.getUniformLocation(program, "u_model");
  const uView = gl.getUniformLocation(program, "u_view");
  const uProj = gl.getUniformLocation(program, "u_projection");
  const uLightPos = gl.getUniformLocation(program, "u_lightPos");
  const uViewPos = gl.getUniformLocation(program, "u_viewPos");
  const uLightColor = gl.getUniformLocation(program, "u_lightColor");
  const uBump = gl.getUniformLocation(program, "u_bumpStrength");
  const uNormalMap = gl.getUniformLocation(program, "u_normalMap");

  // 정점 버퍼
  const planeData = createPlaneData();
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, planeData, gl.STATIC_DRAW);

  // 노멀맵 텍스처
  const normalTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, normalTex);
  const normalMapData = createBrickNormalMap();
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, normalMapData);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // 마우스로 광원 위치 조작
  let lightX = 2;
  let lightY = 2;

  const onMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    lightX = nx * 3;
    lightY = ny * 3;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.touches[0].clientY - rect.top) / rect.height) * 2 - 1);
    lightX = nx * 3;
    lightY = ny * 3;
  };

  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("touchmove", onTouchMove, { passive: true });

  return {
    render(time: number, params: ParamValues) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(0.05, 0.05, 0.08, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      gl.useProgram(program);

      const aspect = canvas.clientWidth / canvas.clientHeight;
      const proj = perspective(Math.PI / 4, aspect, 0.1, 100);
      const viewPos: [number, number, number] = [0, 0, 5];
      const view = lookAt(viewPos, [0, 0, 0], [0, 1, 0]);

      const bumpStrength = params.bumpStrength as number;
      const lightColor = hexToRgb(params.lightColor as string);

      // 모델: 약간의 자동 회전
      const model = rotateY(identity(), time * 0.0002);

      gl.uniformMatrix4fv(uProj, false, proj);
      gl.uniformMatrix4fv(uView, false, view);
      gl.uniformMatrix4fv(uModel, false, model);
      gl.uniform3f(uLightPos, lightX, lightY, 3);
      gl.uniform3fv(uViewPos, viewPos);
      gl.uniform3f(uLightColor, lightColor[0], lightColor[1], lightColor[2]);
      gl.uniform1f(uBump, bumpStrength);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, normalTex);
      gl.uniform1i(uNormalMap, 0);

      const STRIDE = 11 * 4;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, STRIDE, 0);
      gl.enableVertexAttribArray(aUv);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, STRIDE, 3 * 4);
      gl.enableVertexAttribArray(aNormal);
      gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, STRIDE, 5 * 4);
      gl.enableVertexAttribArray(aTangent);
      gl.vertexAttribPointer(aTangent, 3, gl.FLOAT, false, STRIDE, 8 * 4);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },

    cleanup() {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(normalTex);
      gl.deleteProgram(program);
    },
  };
}
