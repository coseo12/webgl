import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type ParamValues } from "@/lib/params";
import { type Renderer } from "./types";

export const VERT = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}`;

export const FRAG = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_textureA;
uniform sampler2D u_textureB;
uniform float u_mixRatio;
void main() {
  vec4 colorA = texture2D(u_textureA, v_texCoord);
  vec4 colorB = texture2D(u_textureB, v_texCoord);
  gl_FragColor = mix(colorA, colorB, u_mixRatio);
}`;

const TEX_SIZE = 8;

/** 체커보드 텍스처 */
function createCheckerboard(): Uint8Array {
  const data = new Uint8Array(TEX_SIZE * TEX_SIZE * 4);
  for (let y = 0; y < TEX_SIZE; y++) {
    for (let x = 0; x < TEX_SIZE; x++) {
      const idx = (y * TEX_SIZE + x) * 4;
      const c = (x + y) % 2 === 0 ? 230 : 50;
      data[idx] = c; data[idx+1] = c; data[idx+2] = c; data[idx+3] = 255;
    }
  }
  return data;
}

/** 스트라이프 텍스처 (세로줄) */
function createStripes(): Uint8Array {
  const data = new Uint8Array(TEX_SIZE * TEX_SIZE * 4);
  for (let y = 0; y < TEX_SIZE; y++) {
    for (let x = 0; x < TEX_SIZE; x++) {
      const idx = (y * TEX_SIZE + x) * 4;
      const isStripe = x % 2 === 0;
      data[idx] = isStripe ? 60 : 200;
      data[idx+1] = isStripe ? 120 : 220;
      data[idx+2] = isStripe ? 200 : 100;
      data[idx+3] = 255;
    }
  }
  return data;
}

function createTex(gl: WebGLRenderingContext, pixels: Uint8Array): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, TEX_SIZE, TEX_SIZE, 0,
    gl.RGBA, gl.UNSIGNED_BYTE, pixels
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  return tex;
}

export function createMultiTextureRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);

  const data = new Float32Array([
    -0.6, -0.6, 0, 0,  0.6, -0.6, 1, 0,
     0.6,  0.6, 1, 1, -0.6,  0.6, 0, 1,
  ]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  const texA = createTex(gl, createCheckerboard());
  const texB = createTex(gl, createStripes());

  const aPos = gl.getAttribLocation(program, "a_position");
  const aTexCoord = gl.getAttribLocation(program, "a_texCoord");
  const uTexA = gl.getUniformLocation(program, "u_textureA");
  const uTexB = gl.getUniformLocation(program, "u_textureB");
  const uMix = gl.getUniformLocation(program, "u_mixRatio");
  const STRIDE = 4 * 4;

  return {
    render(_time: number, params: ParamValues) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.1, 0.1, 0.1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const mixRatio = (params.mixRatio as number) ?? 0.5;

      gl.useProgram(program);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texA);
      gl.uniform1i(uTexA, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texB);
      gl.uniform1i(uTexB, 1);

      gl.uniform1f(uMix, mixRatio);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, STRIDE, 0);
      gl.enableVertexAttribArray(aTexCoord);
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, STRIDE, 2 * 4);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    },
    cleanup() {
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteTexture(texA);
      gl.deleteTexture(texB);
      gl.deleteProgram(program);
    },
  };
}
