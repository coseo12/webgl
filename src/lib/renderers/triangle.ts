import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type Renderer } from "./types";

const VERT = `
attribute vec2 a_position;
attribute vec3 a_color;
varying vec3 v_color;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_color = a_color;
}`;

const FRAG = `
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`;

export function createTriangleRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);

  // 위치(x,y) + 색상(r,g,b) 인터리브
  const data = new Float32Array([
    // prettier-ignore
     0.0,  0.6,   1.0, 0.0, 0.0,
    -0.6, -0.4,   0.0, 1.0, 0.0,
     0.6, -0.4,   0.0, 0.0, 1.0,
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "a_position");
  const aColor = gl.getAttribLocation(program, "a_color");

  const STRIDE = 5 * 4;

  return {
    render() {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
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
