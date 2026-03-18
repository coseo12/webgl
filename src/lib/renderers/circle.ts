import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type ParamValues } from "@/lib/params";
import { type Renderer } from "./types";

export const VERT = `
attribute vec2 a_position;
attribute vec3 a_color;
varying vec3 v_color;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_color = a_color;
}`;

export const FRAG = `
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`;

// HSL(h, 0.8, 0.6) → RGB (h: 0~1)
function hsl(h: number): [number, number, number] {
  const s = 0.8, l = 0.6;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  const sector = Math.floor(h * 6) % 6;
  const rgb: [number, number, number][] = [
    [c, x, 0], [x, c, 0], [0, c, x],
    [0, x, c], [x, 0, c], [c, 0, x],
  ];
  const [r, g, b] = rgb[sector];
  return [r + m, g + m, b + m];
}

export function createCircleRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);
  const aPos = gl.getAttribLocation(program, "a_position");
  const aColor = gl.getAttribLocation(program, "a_color");

  const buffer = gl.createBuffer();
  const STRIDE = 5 * 4;
  let prevSegments = -1;

  // segments 변경 시 버텍스 데이터 재생성
  function buildCircle(segments: number) {
    // 중심점 + 둘레 (segments + 1)개 = TRIANGLE_FAN
    const count = segments + 2;
    const data = new Float32Array(count * 5);

    // 중심: 흰색
    data[0] = 0; data[1] = 0;
    data[2] = 1; data[3] = 1; data[4] = 1;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const idx = (i + 1) * 5;
      data[idx] = Math.cos(angle) * 0.6;
      data[idx + 1] = Math.sin(angle) * 0.6;
      const [r, g, b] = hsl(i / segments);
      data[idx + 2] = r;
      data[idx + 3] = g;
      data[idx + 4] = b;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    prevSegments = segments;
  }

  return {
    render(_time: number, params: ParamValues) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.05, 0.05, 0.1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const segments = Math.floor((params.segments as number) ?? 32);
      if (segments !== prevSegments) {
        buildCircle(segments);
      }

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, STRIDE, 0);
      gl.enableVertexAttribArray(aColor);
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE, 2 * 4);

      gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 2);
    },
    cleanup() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
