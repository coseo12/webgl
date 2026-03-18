import { createProgram, resizeCanvas } from "@/lib/webgl";
import * as mat from "@/lib/matrix";
import { type Renderer } from "./types";

const VERT = `
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
uniform mat4 u_mvp;
uniform mat4 u_model;
varying vec3 v_normal;
varying vec3 v_color;
void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
  // 노멀 변환 (단순 회전만 있으므로 모델 행렬 사용)
  v_normal = mat3(u_model) * a_normal;
  v_color = a_color;
}`;

const FRAG = `
precision mediump float;
varying vec3 v_normal;
varying vec3 v_color;
uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
void main() {
  vec3 normal = normalize(v_normal);
  float diff = max(dot(normal, normalize(u_lightDir)), 0.0);
  vec3 ambient = vec3(0.15);
  vec3 color = v_color * (ambient + u_lightColor * diff);
  gl_FragColor = vec4(color, 1.0);
}`;

function createCubeWithNormals(): {
  vertices: Float32Array;
  indices: Uint16Array;
} {
  // 위치(3) + 노멀(3) + 색상(3) per vertex, 면당 4개
  const faces: {
    normal: number[];
    color: number[];
    verts: number[][];
  }[] = [
    {
      normal: [0, 0, 1],
      color: [0.9, 0.4, 0.4],
      verts: [
        [-0.5, -0.5, 0.5],
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0.5],
        [-0.5, 0.5, 0.5],
      ],
    },
    {
      normal: [0, 0, -1],
      color: [0.4, 0.9, 0.4],
      verts: [
        [0.5, -0.5, -0.5],
        [-0.5, -0.5, -0.5],
        [-0.5, 0.5, -0.5],
        [0.5, 0.5, -0.5],
      ],
    },
    {
      normal: [0, 1, 0],
      color: [0.4, 0.4, 0.9],
      verts: [
        [-0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5],
        [0.5, 0.5, -0.5],
        [-0.5, 0.5, -0.5],
      ],
    },
    {
      normal: [0, -1, 0],
      color: [0.9, 0.9, 0.4],
      verts: [
        [-0.5, -0.5, -0.5],
        [0.5, -0.5, -0.5],
        [0.5, -0.5, 0.5],
        [-0.5, -0.5, 0.5],
      ],
    },
    {
      normal: [1, 0, 0],
      color: [0.4, 0.9, 0.9],
      verts: [
        [0.5, -0.5, 0.5],
        [0.5, -0.5, -0.5],
        [0.5, 0.5, -0.5],
        [0.5, 0.5, 0.5],
      ],
    },
    {
      normal: [-1, 0, 0],
      color: [0.9, 0.4, 0.9],
      verts: [
        [-0.5, -0.5, -0.5],
        [-0.5, -0.5, 0.5],
        [-0.5, 0.5, 0.5],
        [-0.5, 0.5, -0.5],
      ],
    },
  ];

  const v: number[] = [];
  const idx: number[] = [];

  faces.forEach((face, i) => {
    for (const vert of face.verts) {
      v.push(...vert, ...face.normal, ...face.color);
    }
    const off = i * 4;
    idx.push(off, off + 1, off + 2, off, off + 2, off + 3);
  });

  return {
    vertices: new Float32Array(v),
    indices: new Uint16Array(idx),
  };
}

export function createDiffuseRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);
  const { vertices, indices } = createCubeWithNormals();

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
  const uLightDir = gl.getUniformLocation(program, "u_lightDir");
  const uLightColor = gl.getUniformLocation(program, "u_lightColor");
  const STRIDE = 9 * 4;

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
      model = mat.rotateX(model, time * 0.0007);
      model = mat.rotateY(model, time * 0.001);
      const mvp = mat.multiply(proj, model);

      gl.useProgram(program);
      gl.uniformMatrix4fv(uMvp, false, mvp);
      gl.uniformMatrix4fv(uModel, false, model);
      gl.uniform3f(uLightDir, 0.5, 0.7, 1.0);
      gl.uniform3f(uLightColor, 1.0, 1.0, 0.95);

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
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteProgram(program);
    },
  };
}
