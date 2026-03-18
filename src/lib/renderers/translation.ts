import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type Renderer } from "./types";

const VERT = `
attribute vec2 a_position;
uniform vec2 u_translation;
void main() {
  gl_Position = vec4(a_position + u_translation, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
void main() {
  gl_FragColor = vec4(0.3, 0.7, 1.0, 1.0);
}`;

export function createTranslationRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);

  const data = new Float32Array([0.0, 0.15, -0.15, -0.1, 0.15, -0.1]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "a_position");
  const uTranslation = gl.getUniformLocation(program, "u_translation");

  return {
    render(time: number) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const x = Math.sin(time * 0.002) * 0.6;
      const y = Math.cos(time * 0.003) * 0.4;

      gl.useProgram(program);
      gl.uniform2f(uTranslation, x, y);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    cleanup() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
