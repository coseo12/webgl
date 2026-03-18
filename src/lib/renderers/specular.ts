import { createProgram, resizeCanvas } from "@/lib/webgl";
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
uniform vec3 u_lightDir;
uniform vec3 u_viewPos;
uniform float u_shininess;
uniform float u_specularIntensity;
void main() {
  vec3 normal = normalize(v_normal);
  vec3 lightDir = normalize(u_lightDir);
  vec3 viewDir = normalize(u_viewPos - v_worldPos);

  // Ambient
  vec3 ambient = vec3(0.15);

  // Diffuse (Lambert)
  float diff = max(dot(normal, lightDir), 0.0);

  // Specular (Phong)
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow(max(dot(reflectDir, viewDir), 0.0), u_shininess);

  vec3 color = v_color * (ambient + vec3(1.0, 0.98, 0.9) * diff)
             + vec3(1.0) * spec * u_specularIntensity;
  gl_FragColor = vec4(color, 1.0);
}`;

// 큐브 (위치 + 노멀 + 색상)
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

export function createSpecularRenderer(
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
  const uLightDir = gl.getUniformLocation(program, "u_lightDir");
  const uViewPos = gl.getUniformLocation(program, "u_viewPos");
  const uShininess = gl.getUniformLocation(program, "u_shininess");
  const uSpecIntensity = gl.getUniformLocation(program, "u_specularIntensity");
  const STRIDE = 9 * 4;

  return {
    render(time: number, params: ParamValues) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.05, 0.05, 0.1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      const shininess = (params.shininess as number) ?? 32;
      const specIntensity = (params.specularIntensity as number) ?? 0.5;

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
      gl.uniform3f(uViewPos, 0, 0, 0);
      gl.uniform1f(uShininess, shininess);
      gl.uniform1f(uSpecIntensity, specIntensity);

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
