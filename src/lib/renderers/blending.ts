import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type ParamValues } from "@/lib/params";
import { type Renderer } from "./types";

export const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export const FRAG = `
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}`;

const CIRCLE_SEGMENTS = 48;

// 원 버텍스 생성 (TRIANGLE_FAN용, 중심 + 둘레)
function createCircleVerts(cx: number, cy: number, r: number): Float32Array {
  const count = CIRCLE_SEGMENTS + 2;
  const data = new Float32Array(count * 2);
  data[0] = cx;
  data[1] = cy;
  for (let i = 0; i <= CIRCLE_SEGMENTS; i++) {
    const angle = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
    data[(i + 1) * 2] = cx + Math.cos(angle) * r;
    data[(i + 1) * 2 + 1] = cy + Math.sin(angle) * r;
  }
  return data;
}

// 벤 다이어그램: 3개 원의 중심 좌표
const CENTERS: [number, number, number, number, number][] = [
  // cx, cy, r, g, b
  [-0.2, 0.15, 0.9, 0.2, 0.2],  // 빨강 (좌상)
  [0.2, 0.15, 0.2, 0.9, 0.2],   // 초록 (우상)
  [0.0, -0.2, 0.2, 0.2, 0.9],   // 파랑 (하단)
];

export function createBlendingRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);
  const aPos = gl.getAttribLocation(program, "a_position");
  const uColor = gl.getUniformLocation(program, "u_color");

  // 3개의 원 버퍼
  const buffers = CENTERS.map(([cx, cy]) => {
    const verts = createCircleVerts(cx, cy, 0.4);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    return buf;
  });

  const vertCount = CIRCLE_SEGMENTS + 2;

  return {
    render(_time: number, params: ParamValues) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.05, 0.05, 0.1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const alpha = (params.alpha as number) ?? 0.5;
      const mode = (params.blendMode as string) || "normal";

      gl.enable(gl.BLEND);
      if (mode === "additive") {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      } else if (mode === "multiply") {
        gl.blendFunc(gl.DST_COLOR, gl.ZERO);
      } else {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }

      gl.useProgram(program);

      for (let i = 0; i < 3; i++) {
        const [, , r, g, b] = CENTERS[i];
        gl.uniform4f(uColor, r, g, b, alpha);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, vertCount);
      }

      gl.disable(gl.BLEND);
    },
    cleanup() {
      for (const buf of buffers) gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    },
  };
}
