/**
 * Orbit Camera — 마우스 드래그로 3D 오브젝트를 공전 관찰
 * 교육 포인트: lookAt, perspective, 구면좌표 카메라, 마우스/휠 인터랙션
 */

import { type Renderer } from "./types";
import { type ParamValues } from "@/lib/params";
import {
  createProgram,
  resizeCanvas,
} from "@/lib/webgl";
import {
  identity,
  perspective,
  lookAt,
  multiply,
  rotateX,
  rotateY,
} from "@/lib/matrix";

export const VERT = `
attribute vec3 a_position;
attribute vec3 a_color;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec3 v_color;

void main() {
  gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
  v_color = a_color;
}`;

export const FRAG = `
precision mediump float;
varying vec3 v_color;

void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`;

// 큐브 정점: 위치(3) + 색상(3)
// prettier-ignore
const CUBE_VERTICES = new Float32Array([
  // 앞면 (z+) — 빨강
  -1,-1, 1,  0.9,0.3,0.3,   1,-1, 1,  0.9,0.3,0.3,   1, 1, 1,  0.9,0.3,0.3,
  -1,-1, 1,  0.9,0.3,0.3,   1, 1, 1,  0.9,0.3,0.3,  -1, 1, 1,  0.9,0.3,0.3,
  // 뒷면 (z-) — 초록
  -1,-1,-1,  0.3,0.8,0.4,  -1, 1,-1,  0.3,0.8,0.4,   1, 1,-1,  0.3,0.8,0.4,
  -1,-1,-1,  0.3,0.8,0.4,   1, 1,-1,  0.3,0.8,0.4,   1,-1,-1,  0.3,0.8,0.4,
  // 윗면 (y+) — 파랑
  -1, 1,-1,  0.3,0.5,0.9,  -1, 1, 1,  0.3,0.5,0.9,   1, 1, 1,  0.3,0.5,0.9,
  -1, 1,-1,  0.3,0.5,0.9,   1, 1, 1,  0.3,0.5,0.9,   1, 1,-1,  0.3,0.5,0.9,
  // 아랫면 (y-) — 노랑
  -1,-1,-1,  0.9,0.8,0.2,   1,-1,-1,  0.9,0.8,0.2,   1,-1, 1,  0.9,0.8,0.2,
  -1,-1,-1,  0.9,0.8,0.2,   1,-1, 1,  0.9,0.8,0.2,  -1,-1, 1,  0.9,0.8,0.2,
  // 오른면 (x+) — 보라
  1,-1,-1,   0.7,0.3,0.8,   1, 1,-1,  0.7,0.3,0.8,   1, 1, 1,  0.7,0.3,0.8,
  1,-1,-1,   0.7,0.3,0.8,   1, 1, 1,  0.7,0.3,0.8,   1,-1, 1,  0.7,0.3,0.8,
  // 왼면 (x-) — 시안
  -1,-1,-1,  0.2,0.8,0.8,  -1,-1, 1,  0.2,0.8,0.8,  -1, 1, 1,  0.2,0.8,0.8,
  -1,-1,-1,  0.2,0.8,0.8,  -1, 1, 1,  0.2,0.8,0.8,  -1, 1,-1,  0.2,0.8,0.8,
]);

export function createOrbitCameraRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);

  const aPos = gl.getAttribLocation(program, "a_position");
  const aColor = gl.getAttribLocation(program, "a_color");
  const uModel = gl.getUniformLocation(program, "u_model");
  const uView = gl.getUniformLocation(program, "u_view");
  const uProj = gl.getUniformLocation(program, "u_projection");

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, CUBE_VERTICES, gl.STATIC_DRAW);

  // 카메라 상태 (구면 좌표)
  let theta = 0.5;  // 수평 각도
  let phi = 0.4;    // 수직 각도
  let radius = 5;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const SENSITIVITY = 0.005;
  const MIN_PHI = -Math.PI / 2 + 0.01;
  const MAX_PHI = Math.PI / 2 - 0.01;
  const MIN_RADIUS = 2;
  const MAX_RADIUS = 15;

  const onMouseDown = (e: MouseEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    theta -= dx * SENSITIVITY;
    phi = Math.max(MIN_PHI, Math.min(MAX_PHI, phi + dy * SENSITIVITY));
    lastX = e.clientX;
    lastY = e.clientY;
  };

  const onMouseUp = () => {
    dragging = false;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    radius = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radius + e.deltaY * 0.01));
  };

  // 터치 지원
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      dragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!dragging || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - lastX;
    const dy = e.touches[0].clientY - lastY;
    theta -= dx * SENSITIVITY;
    phi = Math.max(MIN_PHI, Math.min(MAX_PHI, phi + dy * SENSITIVITY));
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  };

  const onTouchEnd = () => {
    dragging = false;
  };

  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd);

  gl.enable(gl.DEPTH_TEST);

  return {
    render(time: number, params: ParamValues) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(0.08, 0.08, 0.12, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(program);

      const autoRotate = params.autoRotate as boolean;
      const rotateSpeed = params.rotateSpeed as number;
      if (autoRotate && !dragging) {
        theta += rotateSpeed * 0.001;
      }

      // 구면 좌표 → 카테시안
      const camX = radius * Math.cos(phi) * Math.sin(theta);
      const camY = radius * Math.sin(phi);
      const camZ = radius * Math.cos(phi) * Math.cos(theta);

      const aspect = canvas.clientWidth / canvas.clientHeight;
      const proj = perspective(Math.PI / 4, aspect, 0.1, 100);
      const view = lookAt([camX, camY, camZ], [0, 0, 0], [0, 1, 0]);

      // 큐브 자전
      const t = time * 0.0003;
      let model = identity();
      model = rotateY(model, t);
      model = rotateX(model, t * 0.7);

      gl.uniformMatrix4fv(uProj, false, proj);
      gl.uniformMatrix4fv(uView, false, view);
      gl.uniformMatrix4fv(uModel, false, model);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      const stride = 6 * 4; // 6 floats × 4 bytes
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(aColor);
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, stride, 3 * 4);

      gl.drawArrays(gl.TRIANGLES, 0, 36);
    },

    cleanup() {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
