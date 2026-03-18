import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type ParamValues } from "@/lib/params";
import { type Renderer } from "./types";

const VERT = `
attribute vec2 a_position;
attribute vec3 a_color;
uniform float u_angle;
varying vec3 v_color;
void main() {
  float c = cos(u_angle);
  float s = sin(u_angle);
  vec2 rotated = vec2(
    a_position.x * c - a_position.y * s,
    a_position.x * s + a_position.y * c
  );
  gl_Position = vec4(rotated, 0.0, 1.0);
  v_color = a_color;
}`;

const FRAG = `
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`;

export function createRotationRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);

  const data = new Float32Array([
    // prettier-ignore
     0.0,  0.5,   1.0, 0.4, 0.1,
    -0.5, -0.3,   0.1, 1.0, 0.4,
     0.5, -0.3,   0.4, 0.1, 1.0,
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "a_position");
  const aColor = gl.getAttribLocation(program, "a_color");
  const uAngle = gl.getUniformLocation(program, "u_angle");
  const STRIDE = 5 * 4;

  return {
    render(time: number, params: ParamValues) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const speed = (params.speed as number) ?? 1;
      const autoRotate = (params.autoRotate as boolean) ?? true;
      const angle = autoRotate ? time * 0.001 * speed : speed;

      gl.useProgram(program);
      gl.uniform1f(uAngle, angle);

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
