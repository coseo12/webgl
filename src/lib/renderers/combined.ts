import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type ParamValues } from "@/lib/params";
import { type Renderer } from "./types";

export const VERT = `
attribute vec2 a_position;
attribute vec3 a_color;
uniform mat3 u_matrix;
varying vec3 v_color;
void main() {
  vec3 pos = u_matrix * vec3(a_position, 1.0);
  gl_Position = vec4(pos.xy, 0.0, 1.0);
  v_color = a_color;
}`;

export const FRAG = `
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`;

// 2D 변환 행렬 (3x3, column-major)
function mat3Identity(): Float32Array {
  // prettier-ignore
  return new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ]);
}

function mat3Translate(tx: number, ty: number): Float32Array {
  // prettier-ignore
  return new Float32Array([
    1,  0,  0,
    0,  1,  0,
    tx, ty, 1,
  ]);
}

function mat3Rotate(angle: number): Float32Array {
  const c = Math.cos(angle), s = Math.sin(angle);
  // prettier-ignore
  return new Float32Array([
    c,  s, 0,
   -s,  c, 0,
    0,  0, 1,
  ]);
}

function mat3Scale(sx: number, sy: number): Float32Array {
  // prettier-ignore
  return new Float32Array([
    sx, 0,  0,
    0,  sy, 0,
    0,  0,  1,
  ]);
}

function mat3Multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(9);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out[j * 3 + i] =
        a[i] * b[j * 3] + a[3 + i] * b[j * 3 + 1] + a[6 + i] * b[j * 3 + 2];
    }
  }
  return out;
}

// 변환 순서에 따라 행렬 조합
function buildMatrix(
  order: string,
  tx: number, ty: number,
  angle: number,
  scale: number
): Float32Array {
  const T = mat3Translate(tx, ty);
  const R = mat3Rotate(angle);
  const S = mat3Scale(scale, scale);

  const map: Record<string, Float32Array[]> = {
    TRS: [T, R, S],
    TSR: [T, S, R],
    RTS: [R, T, S],
    SRT: [S, R, T],
  };

  const matrices = map[order] || map.TRS;
  // 오른쪽부터 적용: M = M0 * M1 * M2
  let result = mat3Identity();
  for (const m of matrices) {
    result = mat3Multiply(m, result);
  }
  return result;
}

export function createCombinedRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);

  const data = new Float32Array([
    // prettier-ignore
     0.0,  0.4,   0.9, 0.3, 0.3,
    -0.35, -0.3,  0.3, 0.9, 0.3,
     0.35, -0.3,  0.3, 0.3, 0.9,
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "a_position");
  const aColor = gl.getAttribLocation(program, "a_color");
  const uMatrix = gl.getUniformLocation(program, "u_matrix");
  const STRIDE = 5 * 4;

  return {
    render(_time: number, params: ParamValues) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.05, 0.05, 0.1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const order = (params.order as string) || "TRS";
      const tx = (params.tx as number) ?? 0;
      const ty = (params.ty as number) ?? 0;
      const angleDeg = (params.angle as number) ?? 0;
      const scale = (params.scale as number) ?? 1;

      const matrix = buildMatrix(
        order, tx, ty,
        (angleDeg * Math.PI) / 180,
        scale
      );

      gl.useProgram(program);
      gl.uniformMatrix3fv(uMatrix, false, matrix);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, STRIDE, 0);
      gl.enableVertexAttribArray(aColor);
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE, 2 * 4);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    cleanup() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
