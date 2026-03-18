import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type ParamValues } from "@/lib/params";
import { type Renderer } from "./types";

const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG_DEFAULT = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float r = 0.5 + 0.5 * sin(u_time);
  float g = 0.5 + 0.5 * sin(u_time + 2.094);
  float b = 0.5 + 0.5 * sin(u_time + 4.189);
  gl_FragColor = vec4(r, g, b, 1.0);
}`;

const FRAG_GRADIENT = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float r = uv.x * (0.5 + 0.5 * sin(u_time * 0.7));
  float g = uv.y * (0.5 + 0.5 * cos(u_time * 0.5));
  float b = (uv.x + uv.y) * 0.5 * (0.5 + 0.5 * sin(u_time * 0.3));
  gl_FragColor = vec4(r, g, b, 1.0);
}`;

const FRAG_NOISE = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

// 심플렉스 기반 2D 해시
vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution * 4.0;
  float n = noise(uv + u_time * 0.3) * 0.5 + 0.5;
  float n2 = noise(uv * 2.0 - u_time * 0.2) * 0.5 + 0.5;
  vec3 color = vec3(n * 0.4, n2 * 0.6, (n + n2) * 0.35);
  gl_FragColor = vec4(color, 1.0);
}`;

const SHADERS: Record<string, string> = {
  default: FRAG_DEFAULT,
  gradient: FRAG_GRADIENT,
  noise: FRAG_NOISE,
};

// 풀스크린 쿼드
const QUAD = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]);
const QUAD_INDICES = new Uint16Array([0, 1, 2, 0, 2, 3]);

export function createShaderRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const programs: Record<string, WebGLProgram> = {};
  for (const [key, frag] of Object.entries(SHADERS)) {
    programs[key] = createProgram(gl, VERT, frag);
  }

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, QUAD_INDICES, gl.STATIC_DRAW);

  return {
    render(time: number, params: ParamValues) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);

      const shaderType = (params.shaderType as string) ?? "default";
      const program = programs[shaderType] ?? programs.default;

      gl.useProgram(program);

      const aPos = gl.getAttribLocation(program, "a_position");
      const uTime = gl.getUniformLocation(program, "u_time");
      const uRes = gl.getUniformLocation(program, "u_resolution");

      gl.uniform1f(uTime, time * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    },
    cleanup() {
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      for (const p of Object.values(programs)) {
        gl.deleteProgram(p);
      }
    },
  };
}
