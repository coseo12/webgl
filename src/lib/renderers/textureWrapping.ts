import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type ParamValues } from "@/lib/params";
import { type Renderer } from "./types";

export const VERT = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
uniform float u_uvScale;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord * u_uvScale;
}`;

export const FRAG = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_texCoord);
}`;

const TEX_SIZE = 16;

/** 그라데이션 텍스처 — 래핑 차이를 명확히 보여주기 위해 비대칭 패턴 사용 */
function createGradientTexture(): Uint8Array {
  const data = new Uint8Array(TEX_SIZE * TEX_SIZE * 4);
  for (let y = 0; y < TEX_SIZE; y++) {
    for (let x = 0; x < TEX_SIZE; x++) {
      const idx = (y * TEX_SIZE + x) * 4;
      const u = x / (TEX_SIZE - 1);
      const v = y / (TEX_SIZE - 1);
      // 좌→우: 빨강→노랑, 하→상: 어두움→밝음
      data[idx] = Math.round(u * 220 + 30);
      data[idx + 1] = Math.round(v * 180 + 40);
      data[idx + 2] = Math.round((1 - u) * 150 + 50);
      data[idx + 3] = 255;
    }
  }
  return data;
}

const WRAP_MODES: Record<string, number> = {
  repeat: 0x2901,    // gl.REPEAT
  mirrored: 0x8370,  // gl.MIRRORED_REPEAT
  clamp: 0x812F,     // gl.CLAMP_TO_EDGE
};

export function createTextureWrappingRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);

  const data = new Float32Array([
    -0.7, -0.7, 0, 0,  0.7, -0.7, 1, 0,
     0.7,  0.7, 1, 1, -0.7,  0.7, 0, 1,
  ]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // 텍스처 생성
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, TEX_SIZE, TEX_SIZE, 0,
    gl.RGBA, gl.UNSIGNED_BYTE, createGradientTexture()
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const aPos = gl.getAttribLocation(program, "a_position");
  const aTexCoord = gl.getAttribLocation(program, "a_texCoord");
  const uTexture = gl.getUniformLocation(program, "u_texture");
  const uUvScale = gl.getUniformLocation(program, "u_uvScale");
  const STRIDE = 4 * 4;

  let prevWrapMode = "";

  return {
    render(_time: number, params: ParamValues) {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.1, 0.1, 0.1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const wrapMode = (params.wrapMode as string) || "repeat";
      const uvScale = (params.uvScale as number) ?? 2;

      // 래핑 모드 변경 시 텍스처 파라미터 업데이트
      if (wrapMode !== prevWrapMode) {
        const glWrap = WRAP_MODES[wrapMode] ?? gl.REPEAT;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, glWrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, glWrap);
        prevWrapMode = wrapMode;
      }

      gl.useProgram(program);
      gl.uniform1f(uUvScale, uvScale);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uTexture, 0);

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
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
    },
  };
}
