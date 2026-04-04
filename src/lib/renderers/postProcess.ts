/**
 * Post Processing — FBO 렌더 → 화면 쿼드에 이미지 필터 적용
 * 교육 포인트: Framebuffer Object, 오프스크린 렌더링, 이미지 필터 커널
 */

import { type Renderer } from "./types";
import { type ParamValues } from "@/lib/params";
import { createProgram, resizeCanvas } from "@/lib/webgl";

// 장면 렌더용 셰이더 (회전하는 색상 큐브)
const SCENE_VERT = `
precision mediump float;
attribute vec2 a_position;
uniform float u_time;

varying vec2 v_uv;
varying vec3 v_color;

void main() {
  v_uv = a_position * 0.5 + 0.5;

  // 시간에 따라 색상 변화
  float t = u_time * 0.5;
  v_color = vec3(
    sin(v_uv.x * 6.28 + t) * 0.5 + 0.5,
    sin(v_uv.y * 6.28 + t * 1.3) * 0.5 + 0.5,
    sin((v_uv.x + v_uv.y) * 3.14 + t * 0.7) * 0.5 + 0.5
  );

  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const SCENE_FRAG = `
precision mediump float;
varying vec2 v_uv;
varying vec3 v_color;

uniform float u_time;

void main() {
  // 여러 원과 패턴으로 구성된 장면
  float t = u_time * 0.3;
  vec2 uv = v_uv;

  vec3 color = vec3(0.0);

  // 움직이는 원들
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec2 center = vec2(
      0.5 + 0.3 * cos(t + fi * 1.256),
      0.5 + 0.3 * sin(t * 1.1 + fi * 1.256)
    );
    float d = length(uv - center);
    float radius = 0.08 + 0.02 * sin(t + fi);

    // 원 내부: 색상
    if (d < radius) {
      vec3 c = vec3(
        sin(fi * 1.0) * 0.5 + 0.5,
        sin(fi * 2.0) * 0.5 + 0.5,
        sin(fi * 3.0) * 0.5 + 0.5
      );
      color = mix(color, c, smoothstep(radius, radius - 0.01, d));
    }

    // 원 경계: 밝은 링
    float ring = smoothstep(0.005, 0.0, abs(d - radius));
    color += ring * vec3(0.8);
  }

  // 배경 그라데이션
  color += v_color * 0.15;

  gl_FragColor = vec4(color, 1.0);
}`;

// 포스트 프로세싱 셰이더
export const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export const FRAG = `
precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform int u_filter;

varying vec2 v_uv;

// 3x3 컨볼루션 (mat3는 column-major이므로 kernel[col][row] 순서로 접근)
vec3 convolve(mat3 kernel) {
  vec2 texel = 1.0 / u_resolution;
  vec3 result = vec3(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y)) * texel;
      vec3 s = texture2D(u_texture, v_uv + offset).rgb;
      result += s * kernel[x + 1][y + 1];
    }
  }
  return result;
}

void main() {
  vec3 color;

  if (u_filter == 0) {
    // 원본 (패스스루)
    color = texture2D(u_texture, v_uv).rgb;

  } else if (u_filter == 1) {
    // 흑백
    color = texture2D(u_texture, v_uv).rgb;
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = vec3(gray);

  } else if (u_filter == 2) {
    // 반전
    color = 1.0 - texture2D(u_texture, v_uv).rgb;

  } else if (u_filter == 3) {
    // 엣지 디텍션 (Sobel)
    mat3 sobelX = mat3(-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -1.0, 0.0, 1.0);
    mat3 sobelY = mat3(-1.0, -2.0, -1.0, 0.0, 0.0, 0.0, 1.0, 2.0, 1.0);
    vec3 gx = convolve(sobelX);
    vec3 gy = convolve(sobelY);
    color = sqrt(gx * gx + gy * gy);

  } else if (u_filter == 4) {
    // 블러 (Box Blur)
    mat3 blur = mat3(
      1.0/9.0, 1.0/9.0, 1.0/9.0,
      1.0/9.0, 1.0/9.0, 1.0/9.0,
      1.0/9.0, 1.0/9.0, 1.0/9.0
    );
    color = convolve(blur);

  } else if (u_filter == 5) {
    // 샤프닝
    mat3 sharpen = mat3(
       0.0, -1.0,  0.0,
      -1.0,  5.0, -1.0,
       0.0, -1.0,  0.0
    );
    color = convolve(sharpen);

  } else if (u_filter == 6) {
    // 엠보싱
    mat3 emboss = mat3(
      -2.0, -1.0, 0.0,
      -1.0,  1.0, 1.0,
       0.0,  1.0, 2.0
    );
    color = convolve(emboss) + 0.5;

  } else {
    color = texture2D(u_texture, v_uv).rgb;
  }

  gl_FragColor = vec4(color, 1.0);
}`;

export function createPostProcessRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  // 장면 프로그램
  const sceneProgram = createProgram(gl, SCENE_VERT, SCENE_FRAG);
  const sceneTimeLoc = gl.getUniformLocation(sceneProgram, "u_time");

  // 포스트 프로세싱 프로그램
  const postProgram = createProgram(gl, VERT, FRAG);
  const postTexLoc = gl.getUniformLocation(postProgram, "u_texture");
  const postResLoc = gl.getUniformLocation(postProgram, "u_resolution");
  const postFilterLoc = gl.getUniformLocation(postProgram, "u_filter");

  // 풀스크린 쿼드 버퍼
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  // FBO 생성
  const fbo = gl.createFramebuffer();
  const fboTexture = gl.createTexture();
  let fboWidth = 0;
  let fboHeight = 0;

  function resizeFBO(width: number, height: number) {
    if (width === fboWidth && height === fboHeight) return;
    fboWidth = width;
    fboHeight = height;

    gl.bindTexture(gl.TEXTURE_2D, fboTexture);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA,
      width, height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, fboTexture, 0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  const FILTER_MAP: Record<string, number> = {
    none: 0,
    grayscale: 1,
    invert: 2,
    edge: 3,
    blur: 4,
    sharpen: 5,
    emboss: 6,
  };

  return {
    render(time: number, params: ParamValues) {
      resizeCanvas(canvas);
      const w = gl.drawingBufferWidth;
      const h = gl.drawingBufferHeight;
      resizeFBO(w, h);

      const filterKey = params.filter as string;
      const filterIndex = FILTER_MAP[filterKey] ?? 0;
      const t = time * 0.001;

      // 패스 1: 장면을 FBO에 렌더
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0.05, 0.05, 0.08, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(sceneProgram);
      gl.uniform1f(sceneTimeLoc, t);

      const aPos1 = gl.getAttribLocation(sceneProgram, "a_position");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPos1);
      gl.vertexAttribPointer(aPos1, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // 패스 2: FBO 텍스처에 포스트 프로세싱 → 화면 출력
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(postProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboTexture);
      gl.uniform1i(postTexLoc, 0);
      gl.uniform2f(postResLoc, w, h);
      gl.uniform1i(postFilterLoc, filterIndex);

      const aPos2 = gl.getAttribLocation(postProgram, "a_position");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPos2);
      gl.vertexAttribPointer(aPos2, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },

    cleanup() {
      gl.deleteBuffer(buffer);
      gl.deleteTexture(fboTexture);
      gl.deleteFramebuffer(fbo);
      gl.deleteProgram(sceneProgram);
      gl.deleteProgram(postProgram);
    },
  };
}
