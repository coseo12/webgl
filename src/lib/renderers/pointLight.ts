import { createProgram, resizeCanvas, hexToRgb } from "@/lib/webgl";
import * as mat from "@/lib/matrix";
import { type ParamValues } from "@/lib/params";
import { type Renderer } from "./types";

export const VERT = `
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
uniform mat4 u_mvp;
uniform mat4 u_model;
varying vec3 v_normal;
varying vec3 v_worldPos;
varying vec3 v_color;
void main() {
  vec4 worldPos = u_model * vec4(a_position, 1.0);
  v_worldPos = worldPos.xyz;
  gl_Position = u_mvp * vec4(a_position, 1.0);
  v_normal = mat3(u_model) * a_normal;
  v_color = a_color;
}`;

export const FRAG = `
precision mediump float;
varying vec3 v_normal;
varying vec3 v_worldPos;
varying vec3 v_color;
uniform vec3 u_lightPos;
uniform vec3 u_lightColor;
uniform float u_attenuation;
void main() {
  vec3 normal = normalize(v_normal);
  vec3 lightVec = u_lightPos - v_worldPos;
  float dist = length(lightVec);
  vec3 lightDir = lightVec / dist;

  // 거리 감쇠
  float atten = 1.0 / (1.0 + u_attenuation * dist * dist);

  // Ambient + Diffuse
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 ambient = vec3(0.1);
  vec3 color = v_color * (ambient + u_lightColor * diff * atten);
  gl_FragColor = vec4(color, 1.0);
}`;

// 큐브 (위치 + 노멀 + 색상) — diffuse.ts와 동일 구조
function createCube(): { vertices: Float32Array; indices: Uint16Array } {
  const faces: { n: number[]; c: number[]; v: number[][] }[] = [
    { n: [0,0,1],  c: [0.9,0.4,0.4], v: [[-0.5,-0.5,0.5],[0.5,-0.5,0.5],[0.5,0.5,0.5],[-0.5,0.5,0.5]] },
    { n: [0,0,-1], c: [0.4,0.9,0.4], v: [[0.5,-0.5,-0.5],[-0.5,-0.5,-0.5],[-0.5,0.5,-0.5],[0.5,0.5,-0.5]] },
    { n: [0,1,0],  c: [0.4,0.4,0.9], v: [[-0.5,0.5,0.5],[0.5,0.5,0.5],[0.5,0.5,-0.5],[-0.5,0.5,-0.5]] },
    { n: [0,-1,0], c: [0.9,0.9,0.4], v: [[-0.5,-0.5,-0.5],[0.5,-0.5,-0.5],[0.5,-0.5,0.5],[-0.5,-0.5,0.5]] },
    { n: [1,0,0],  c: [0.4,0.9,0.9], v: [[0.5,-0.5,0.5],[0.5,-0.5,-0.5],[0.5,0.5,-0.5],[0.5,0.5,0.5]] },
    { n: [-1,0,0], c: [0.9,0.4,0.9], v: [[-0.5,-0.5,-0.5],[-0.5,-0.5,0.5],[-0.5,0.5,0.5],[-0.5,0.5,-0.5]] },
  ];

  const vData: number[] = [];
  const idx: number[] = [];
  faces.forEach((f, i) => {
    for (const vert of f.v) vData.push(...vert, ...f.n, ...f.c);
    const off = i * 4;
    idx.push(off, off+1, off+2, off, off+2, off+3);
  });

  return { vertices: new Float32Array(vData), indices: new Uint16Array(idx) };
}

export function createPointLightRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);
  const { vertices, indices } = createCube();

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "a_position");
  const aNormal = gl.getAttribLocation(program, "a_normal");
  const aColor = gl.getAttribLocation(program, "a_color");
  const uMvp = gl.getUniformLocation(program, "u_mvp");
  const uModel = gl.getUniformLocation(program, "u_model");
  const uLightPos = gl.getUniformLocation(program, "u_lightPos");
  const uLightColor = gl.getUniformLocation(program, "u_lightColor");
  const uAttenuation = gl.getUniformLocation(program, "u_attenuation");
  const STRIDE = 9 * 4;

  // 마우스로 광원 위치 이동
  let lightX = 1.5;
  let lightY = 1.0;
  let isDragging = false;

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    updateLightPos(e);
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateLightPos(e);
  };
  const onMouseUp = () => { isDragging = false; };

  function updateLightPos(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    // 캔버스 좌표를 월드 XY로 매핑 (-3 ~ 3 범위)
    lightX = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    lightY = (0.5 - (e.clientY - rect.top) / rect.height) * 6;
  }

  // 터치 지원
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging = true;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      lightX = ((touch.clientX - rect.left) / rect.width - 0.5) * 6;
      lightY = (0.5 - (touch.clientY - rect.top) / rect.height) * 6;
    }
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lightX = ((touch.clientX - rect.left) / rect.width - 0.5) * 6;
    lightY = (0.5 - (touch.clientY - rect.top) / rect.height) * 6;
  };
  const onTouchEnd = () => { isDragging = false; };

  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: true });

  return {
    render(time: number, params: ParamValues) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.02, 0.02, 0.05, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      const lightColorHex = (params.lightColor as string) || "#FFFFFF";
      const [lr, lg, lb] = hexToRgb(lightColorHex);
      const attenuation = (params.attenuation as number) ?? 1.0;

      const aspect = canvas.width / canvas.height;
      const proj = mat.perspective(Math.PI / 4, aspect, 0.1, 100);
      let model = mat.identity();
      model = mat.translate(model, 0, 0, -3);
      model = mat.rotateX(model, time * 0.0005);
      model = mat.rotateY(model, time * 0.0008);
      const mvp = mat.multiply(proj, model);

      gl.useProgram(program);
      gl.uniformMatrix4fv(uMvp, false, mvp);
      gl.uniformMatrix4fv(uModel, false, model);
      gl.uniform3f(uLightPos, lightX, lightY, 2.0);
      gl.uniform3f(uLightColor, lr, lg, lb);
      gl.uniform1f(uAttenuation, attenuation);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, STRIDE, 0);
      gl.enableVertexAttribArray(aNormal);
      gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, STRIDE, 3 * 4);
      gl.enableVertexAttribArray(aColor);
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE, 6 * 4);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    },
    cleanup() {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteProgram(program);
    },
  };
}
