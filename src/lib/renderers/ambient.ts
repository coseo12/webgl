import { createProgram, resizeCanvas } from "@/lib/webgl";
import * as mat from "@/lib/matrix";
import { type Renderer } from "./types";

export const VERT = `
attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 u_mvp;
varying vec3 v_color;
void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
  v_color = a_color;
}`;

export const FRAG = `
precision mediump float;
varying vec3 v_color;
uniform vec3 u_ambientColor;
uniform float u_ambientIntensity;
void main() {
  vec3 ambient = u_ambientColor * u_ambientIntensity;
  gl_FragColor = vec4(v_color * ambient, 1.0);
}`;

// 큐브 버텍스 (위치 + 색상)
function createCubeData(): { vertices: Float32Array; indices: Uint16Array } {
  // 각 면에 다른 색상
  const v = [
    // 앞면 (빨강)
    -0.5, -0.5, 0.5, 0.9, 0.3, 0.3, 0.5, -0.5, 0.5, 0.9, 0.3, 0.3, 0.5, 0.5,
    0.5, 0.9, 0.3, 0.3, -0.5, 0.5, 0.5, 0.9, 0.3, 0.3,
    // 뒷면 (초록)
    -0.5, -0.5, -0.5, 0.3, 0.9, 0.3, 0.5, -0.5, -0.5, 0.3, 0.9, 0.3, 0.5,
    0.5, -0.5, 0.3, 0.9, 0.3, -0.5, 0.5, -0.5, 0.3, 0.9, 0.3,
    // 윗면 (파랑)
    -0.5, 0.5, -0.5, 0.3, 0.3, 0.9, 0.5, 0.5, -0.5, 0.3, 0.3, 0.9, 0.5, 0.5,
    0.5, 0.3, 0.3, 0.9, -0.5, 0.5, 0.5, 0.3, 0.3, 0.9,
    // 아랫면 (노랑)
    -0.5, -0.5, -0.5, 0.9, 0.9, 0.3, 0.5, -0.5, -0.5, 0.9, 0.9, 0.3, 0.5,
    -0.5, 0.5, 0.9, 0.9, 0.3, -0.5, -0.5, 0.5, 0.9, 0.9, 0.3,
    // 오른쪽 (시안)
    0.5, -0.5, -0.5, 0.3, 0.9, 0.9, 0.5, 0.5, -0.5, 0.3, 0.9, 0.9, 0.5, 0.5,
    0.5, 0.3, 0.9, 0.9, 0.5, -0.5, 0.5, 0.3, 0.9, 0.9,
    // 왼쪽 (마젠타)
    -0.5, -0.5, -0.5, 0.9, 0.3, 0.9, -0.5, 0.5, -0.5, 0.9, 0.3, 0.9, -0.5,
    0.5, 0.5, 0.9, 0.3, 0.9, -0.5, -0.5, 0.5, 0.9, 0.3, 0.9,
  ];

  const idx = [];
  for (let i = 0; i < 6; i++) {
    const off = i * 4;
    idx.push(off, off + 1, off + 2, off, off + 2, off + 3);
  }

  return {
    vertices: new Float32Array(v),
    indices: new Uint16Array(idx),
  };
}

export function createAmbientRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);
  const { vertices, indices } = createCubeData();

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "a_position");
  const aColor = gl.getAttribLocation(program, "a_color");
  const uMvp = gl.getUniformLocation(program, "u_mvp");
  const uAmbientColor = gl.getUniformLocation(program, "u_ambientColor");
  const uAmbientIntensity = gl.getUniformLocation(
    program,
    "u_ambientIntensity"
  );
  const STRIDE = 6 * 4;

  return {
    render(time: number) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.05, 0.05, 0.1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      const aspect = canvas.width / canvas.height;
      const proj = mat.perspective(Math.PI / 4, aspect, 0.1, 100);
      let model = mat.identity();
      model = mat.translate(model, 0, 0, -3);
      model = mat.rotateX(model, time * 0.0008);
      model = mat.rotateY(model, time * 0.001);
      const mvp = mat.multiply(proj, model);

      gl.useProgram(program);
      gl.uniformMatrix4fv(uMvp, false, mvp);
      gl.uniform3f(uAmbientColor, 1.0, 0.95, 0.9);
      gl.uniform1f(uAmbientIntensity, 0.7);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, STRIDE, 0);
      gl.enableVertexAttribArray(aColor);
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE, 3 * 4);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    },
    cleanup() {
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteProgram(program);
    },
  };
}
