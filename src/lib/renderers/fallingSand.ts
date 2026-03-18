import { createProgram, resizeCanvas, hexToRgb } from "@/lib/webgl";
import { type Renderer } from "./types";
import { type ParamValues } from "@/lib/params";

// --- 쉐이더 ---

/** Y축 반전: 그리드 row 0(상단)이 화면 상단에 표시 */
export const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export const FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}`;

// --- 배경색 ---

const BG_R = 13;
const BG_G = 13;
const BG_B = 26;

// --- HSL → RGB 변환 (무지개 모드용) ---

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  const sector = Math.floor(h * 6) % 6;
  switch (sector) {
    case 0: r = c; g = x; break;
    case 1: r = x; g = c; break;
    case 2: g = c; b = x; break;
    case 3: g = x; b = c; break;
    case 4: r = x; b = c; break;
    case 5: r = c; b = x; break;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

// --- 렌더러 ---

const CELL_SIZE = 4;
const MAX_W = 300;
const MAX_H = 200;

export function createFallingSandRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);
  const uTexture = gl.getUniformLocation(program, "u_texture");

  // 쿼드 버퍼
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
    gl.STATIC_DRAW
  );
  const aPos = gl.getAttribLocation(program, "a_position");

  // 그리드 상태 (첫 render에서 초기화)
  let gridW = 0;
  let gridH = 0;
  let cells: Uint8Array; // 0 = 빈 셀, 1 = 모래
  let pixelData: Uint8Array; // RGBA 픽셀 버퍼
  let texture: WebGLTexture | null = null;
  let frameCount = 0;

  function initGrid(w: number, h: number) {
    gridW = Math.min(Math.floor(w / CELL_SIZE), MAX_W);
    gridH = Math.min(Math.floor(h / CELL_SIZE), MAX_H);
    cells = new Uint8Array(gridW * gridH);
    pixelData = new Uint8Array(gridW * gridH * 4);

    // 배경색으로 초기화
    for (let i = 0; i < gridW * gridH; i++) {
      const pi = i * 4;
      pixelData[pi] = BG_R;
      pixelData[pi + 1] = BG_G;
      pixelData[pi + 2] = BG_B;
      pixelData[pi + 3] = 255;
    }

    // 텍스처 생성
    if (texture) gl.deleteTexture(texture);
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, gridW, gridH, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, pixelData
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  // 셀 이동: src → dst, src를 배경으로 복원
  function moveCell(src: number, dst: number) {
    cells[src] = 0;
    cells[dst] = 1;
    const si = src * 4;
    const di = dst * 4;
    pixelData[di] = pixelData[si];
    pixelData[di + 1] = pixelData[si + 1];
    pixelData[di + 2] = pixelData[si + 2];
    pixelData[di + 3] = pixelData[si + 3];
    pixelData[si] = BG_R;
    pixelData[si + 1] = BG_G;
    pixelData[si + 2] = BG_B;
    pixelData[si + 3] = 255;
  }

  // 시뮬레이션 1스텝
  function update() {
    // 좌우 편향 방지: 매 프레임 순회 방향 교대
    const leftToRight = frameCount % 2 === 0;
    const xStart = leftToRight ? 0 : gridW - 1;
    const xEnd = leftToRight ? gridW : -1;
    const xStep = leftToRight ? 1 : -1;

    for (let y = gridH - 2; y >= 0; y--) {
      for (let x = xStart; x !== xEnd; x += xStep) {
        const i = y * gridW + x;
        if (!cells[i]) continue;

        const below = (y + 1) * gridW + x;
        // 아래가 비어있으면 낙하
        if (!cells[below]) {
          moveCell(i, below);
          continue;
        }

        // 대각선 이동 (랜덤 방향 우선)
        const goLeft = Math.random() < 0.5;
        const dx1 = goLeft ? -1 : 1;
        const dx2 = goLeft ? 1 : -1;

        const x1 = x + dx1;
        if (x1 >= 0 && x1 < gridW) {
          const d1 = (y + 1) * gridW + x1;
          if (!cells[d1]) {
            moveCell(i, d1);
            continue;
          }
        }

        const x2 = x + dx2;
        if (x2 >= 0 && x2 < gridW) {
          const d2 = (y + 1) * gridW + x2;
          if (!cells[d2]) {
            moveCell(i, d2);
          }
        }
      }
    }
    frameCount++;
  }

  // 원형 브러시로 모래 배치
  function dropSand(
    cx: number, cy: number, radius: number,
    r: number, g: number, b: number
  ) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || x >= gridW || y < 0 || y >= gridH) continue;
        const i = y * gridW + x;
        if (cells[i]) continue;
        // 확률적 배치로 자연스러운 밀도
        if (Math.random() > 0.6) continue;

        cells[i] = 1;
        // 미세 밝기 변동으로 질감 표현
        const v = Math.floor(Math.random() * 30) - 15;
        const pi = i * 4;
        pixelData[pi] = Math.max(0, Math.min(255, r + v));
        pixelData[pi + 1] = Math.max(0, Math.min(255, g + v));
        pixelData[pi + 2] = Math.max(0, Math.min(255, b + v));
        pixelData[pi + 3] = 255;
      }
    }
  }

  // --- 마우스 인터랙션 ---

  let isMouseDown = false;
  let currentParams: ParamValues = {};

  function getGridPos(e: MouseEvent): [number, number] {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * gridW);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * gridH);
    return [
      Math.max(0, Math.min(gridW - 1, x)),
      Math.max(0, Math.min(gridH - 1, y)),
    ];
  }

  function handleDrop(e: MouseEvent, time: number) {
    if (!gridW) return;
    const [gx, gy] = getGridPos(e);
    const brushSize = (currentParams.brushSize as number) || 3;
    const rainbow = (currentParams.rainbow as boolean) || false;

    let r: number, g: number, b: number;
    if (rainbow) {
      [r, g, b] = hslToRgb((time * 0.00005) % 1, 0.75, 0.55);
    } else {
      const hex = (currentParams.sandColor as string) || "#E8A530";
      const [fr, fg, fb] = hexToRgb(hex);
      r = Math.round(fr * 255);
      g = Math.round(fg * 255);
      b = Math.round(fb * 255);
    }

    dropSand(gx, gy, brushSize, r, g, b);
  }

  let lastTime = 0;

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    isMouseDown = true;
    handleDrop(e, lastTime);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isMouseDown) return;
    handleDrop(e, lastTime);
  };

  const onMouseUp = () => {
    isMouseDown = false;
  };

  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  return {
    render(time: number, params: ParamValues) {
      currentParams = params;
      lastTime = time;

      resizeCanvas(canvas);
      const w = canvas.width;
      const h = canvas.height;

      // 첫 프레임에서 그리드 초기화
      if (gridW === 0) {
        initGrid(w, h);
      }

      // 시뮬레이션 업데이트 (speed 횟수만큼)
      const speed = (params.speed as number) || 2;
      for (let i = 0; i < speed; i++) {
        update();
      }

      // 텍스처 업데이트
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texSubImage2D(
        gl.TEXTURE_2D, 0, 0, 0, gridW, gridH,
        gl.RGBA, gl.UNSIGNED_BYTE, pixelData
      );

      // 화면에 표시
      gl.viewport(0, 0, w, h);
      gl.clearColor(BG_R / 255, BG_G / 255, BG_B / 255, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uTexture, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },

    cleanup() {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (texture) gl.deleteTexture(texture);
      gl.deleteBuffer(quadBuf);
      gl.deleteProgram(program);
    },
  };
}
