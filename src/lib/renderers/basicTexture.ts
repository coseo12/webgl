import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type Renderer } from "./types";

const VERT = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}`;

const FRAG = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_texCoord);
}`;

const CHECKER_SIZE = 8;

/** 프로시저럴 체커보드 텍스처 생성 */
function createCheckerboard(size: number): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const isWhite = (x + y) % 2 === 0;
      const c = isWhite ? 240 : 40;
      data[idx] = c;
      data[idx + 1] = c;
      data[idx + 2] = c;
      data[idx + 3] = 255;
    }
  }
  return data;
}

export function createBasicTextureRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);

  // 위치(2) + UV(2) 인터리브
  const data = new Float32Array([
    -0.6, -0.6, 0.0, 0.0, 0.6, -0.6, 1.0, 0.0, 0.6, 0.6, 1.0, 1.0, -0.6,
    0.6, 0.0, 1.0,
  ]);

  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // 텍스처 생성
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const pixels = createCheckerboard(CHECKER_SIZE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    CHECKER_SIZE,
    CHECKER_SIZE,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixels
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  const aPos = gl.getAttribLocation(program, "a_position");
  const aTexCoord = gl.getAttribLocation(program, "a_texCoord");
  const STRIDE = 4 * 4;

  return {
    render() {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.1, 0.1, 0.1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, STRIDE, 0);
      gl.enableVertexAttribArray(aTexCoord);
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, STRIDE, 2 * 4);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    },
    cleanup() {
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
    },
  };
}
