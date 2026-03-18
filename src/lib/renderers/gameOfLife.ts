import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type ParamValues } from "@/lib/params";
import { type Renderer } from "./types";

// --- 쉐이더 ---

/** 풀스크린 쿼드 버텍스 (공유) */
const QUAD_VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/**
 * 시뮬레이션 쉐이더 — Conway's Game of Life 규칙 (B3/S23)
 * 8방향 이웃(Moore neighborhood) 합산 후 탄생/생존/죽음 판정
 */
export const VERT = QUAD_VERT;

export const FRAG = `
precision mediump float;
uniform sampler2D u_state;
uniform vec2 u_resolution;

void main() {
  vec2 pixel = gl_FragCoord.xy;
  vec2 texel = 1.0 / u_resolution;
  vec2 uv = pixel * texel;

  // 현재 셀 상태 (R 채널: 0.0=dead, 1.0=alive)
  float self = texture2D(u_state, uv).r;

  // Moore neighborhood: 8방향 이웃 alive 수 합산
  float neighbors = 0.0;
  for (float dy = -1.0; dy <= 1.0; dy += 1.0) {
    for (float dx = -1.0; dx <= 1.0; dx += 1.0) {
      if (dx == 0.0 && dy == 0.0) continue;
      vec2 neighborUV = fract(uv + vec2(dx, dy) * texel);
      neighbors += texture2D(u_state, neighborUV).r;
    }
  }

  // B3/S23 규칙
  float alive = 0.0;
  if (self > 0.5) {
    // 생존: 이웃 2 또는 3
    if (neighbors > 1.5 && neighbors < 3.5) alive = 1.0;
  } else {
    // 탄생: 이웃 정확히 3
    if (neighbors > 2.5 && neighbors < 3.5) alive = 1.0;
  }

  gl_FragColor = vec4(alive, alive, alive, 1.0);
}`;

/** 디스플레이 쉐이더 — alive 셀에 색상 적용 */
const DISPLAY_FRAG = `
precision mediump float;
uniform sampler2D u_state;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float alive = texture2D(u_state, uv).r;

  // alive: 밝은 시안, dead: 어두운 배경
  vec3 aliveColor = vec3(0.2, 0.9, 0.8);
  vec3 deadColor = vec3(0.04, 0.04, 0.08);
  vec3 color = mix(deadColor, aliveColor, alive);

  gl_FragColor = vec4(color, 1.0);
}`;

// --- 초기 패턴 ---

const GRID_SIZE = 256;

function createRandomState(): Uint8Array {
  const data = new Uint8Array(GRID_SIZE * GRID_SIZE * 4);
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const alive = Math.random() < 0.3 ? 255 : 0;
    const idx = i * 4;
    data[idx] = alive;
    data[idx + 1] = alive;
    data[idx + 2] = alive;
    data[idx + 3] = 255;
  }
  return data;
}

function createEmptyState(): Uint8Array {
  const data = new Uint8Array(GRID_SIZE * GRID_SIZE * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = 255; // alpha
  }
  return data;
}

function setCell(data: Uint8Array, x: number, y: number) {
  // 래핑 (toroidal)
  const wx = ((x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
  const wy = ((y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
  const idx = (wy * GRID_SIZE + wx) * 4;
  data[idx] = 255;
  data[idx + 1] = 255;
  data[idx + 2] = 255;
}

function stampPattern(data: Uint8Array, cells: [number, number][], ox: number, oy: number) {
  for (const [dx, dy] of cells) {
    setCell(data, ox + dx, oy + dy);
  }
}

// 글라이더
const GLIDER: [number, number][] = [
  [1, 0], [2, 1], [0, 2], [1, 2], [2, 2],
];

// Gosper Glider Gun
const GLIDER_GUN: [number, number][] = [
  [24,0],[22,1],[24,1],[12,2],[13,2],[20,2],[21,2],[34,2],[35,2],
  [11,3],[15,3],[20,3],[21,3],[34,3],[35,3],[0,4],[1,4],[10,4],
  [16,4],[20,4],[21,4],[0,5],[1,5],[10,5],[14,5],[16,5],[17,5],
  [22,5],[24,5],[10,6],[16,6],[24,6],[11,7],[15,7],[12,8],[13,8],
];

// Pulsar (주기 3)
const PULSAR: [number, number][] = (() => {
  const quarter: [number, number][] = [
    [2,1],[3,1],[4,1],[1,2],[1,3],[1,4],[2,6],[3,6],[4,6],[6,2],[6,3],[6,4],
  ];
  const cells: [number, number][] = [];
  for (const [x, y] of quarter) {
    cells.push([x, y], [-x, y], [x, -y], [-x, -y]);
  }
  return cells;
})();

// Lightweight Spaceship (LWSS)
const LWSS: [number, number][] = [
  [1,0],[4,0],[0,1],[0,2],[4,2],[0,3],[1,3],[2,3],[3,3],
];

type PatternName = "random" | "glider" | "gliderGun" | "pulsar" | "lwss";

function createPatternState(pattern: PatternName): Uint8Array {
  if (pattern === "random") return createRandomState();

  const data = createEmptyState();
  const cx = Math.floor(GRID_SIZE / 2);
  const cy = Math.floor(GRID_SIZE / 2);

  switch (pattern) {
    case "glider":
      // 여러 글라이더 배치
      for (let i = 0; i < 5; i++) {
        stampPattern(data, GLIDER, cx - 40 + i * 15, cy - 40 + i * 15);
      }
      break;
    case "gliderGun":
      stampPattern(data, GLIDER_GUN, cx - 20, cy - 5);
      break;
    case "pulsar":
      stampPattern(data, PULSAR, cx, cy);
      break;
    case "lwss":
      // 여러 LWSS 배치
      for (let i = 0; i < 4; i++) {
        stampPattern(data, LWSS, cx - 30, cy - 30 + i * 15);
      }
      break;
  }

  return data;
}

// --- 렌더러 ---

export function createGameOfLifeRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const simProg = createProgram(gl, QUAD_VERT, FRAG);
  const dispProg = createProgram(gl, QUAD_VERT, DISPLAY_FRAG);

  // 시뮬레이션 유니폼
  const simUState = gl.getUniformLocation(simProg, "u_state");
  const simURes = gl.getUniformLocation(simProg, "u_resolution");
  // 디스플레이 유니폼
  const dispUState = gl.getUniformLocation(dispProg, "u_state");
  const dispURes = gl.getUniformLocation(dispProg, "u_resolution");

  // 쿼드 버퍼
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
    gl.STATIC_DRAW
  );

  // 핑퐁 FBO
  const textures: WebGLTexture[] = [];
  const framebuffers: WebGLFramebuffer[] = [];
  let currentFB = 0;

  function createFBOPair(initialData: Uint8Array) {
    for (const t of textures) gl.deleteTexture(t);
    for (const f of framebuffers) gl.deleteFramebuffer(f);
    textures.length = 0;
    framebuffers.length = 0;

    for (let i = 0; i < 2; i++) {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, GRID_SIZE, GRID_SIZE, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, i === 0 ? initialData : createEmptyState()
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0
      );

      textures.push(tex);
      framebuffers.push(fb);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    currentFB = 0;
  }

  function drawQuad(prog: WebGLProgram) {
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // 시뮬레이션 1스텝: 현재 텍스처 → 반대쪽 FBO에 쓰기
  function step() {
    const readTex = textures[currentFB];
    const writeFB = framebuffers[1 - currentFB];

    gl.bindFramebuffer(gl.FRAMEBUFFER, writeFB);
    gl.viewport(0, 0, GRID_SIZE, GRID_SIZE);

    gl.useProgram(simProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, readTex);
    gl.uniform1i(simUState, 0);
    gl.uniform2f(simURes, GRID_SIZE, GRID_SIZE);

    drawQuad(simProg);
    currentFB = 1 - currentFB;
  }

  // --- 마우스: 셀 토글 ---

  let isMouseDown = false;

  function toggleCell(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const gx = Math.floor(((e.clientX - rect.left) / rect.width) * GRID_SIZE);
    const gy = GRID_SIZE - 1 - Math.floor(((e.clientY - rect.top) / rect.height) * GRID_SIZE);
    if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE) return;

    // 현재 텍스처에서 셀 1개를 흰색으로 설정
    const pixel = new Uint8Array([255, 255, 255, 255]);
    gl.bindTexture(gl.TEXTURE_2D, textures[currentFB]);
    gl.texSubImage2D(
      gl.TEXTURE_2D, 0, gx, gy, 1, 1,
      gl.RGBA, gl.UNSIGNED_BYTE, pixel
    );
  }

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    isMouseDown = true;
    toggleCell(e);
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!isMouseDown) return;
    toggleCell(e);
  };
  const onMouseUp = () => { isMouseDown = false; };

  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  // --- 상태 관리 ---

  let initialized = false;
  let prevPattern = "";
  let frameCounter = 0;

  return {
    render(_time: number, params: ParamValues) {
      resizeCanvas(canvas);
      const w = canvas.width;
      const h = canvas.height;

      const pattern = (params.pattern as string) || "random";
      const running = (params.running as boolean) ?? true;
      const speed = (params.speed as number) ?? 5;

      // 초기화 또는 패턴 변경 시 재생성
      if (!initialized || pattern !== prevPattern) {
        createFBOPair(createPatternState(pattern as PatternName));
        prevPattern = pattern;
        initialized = true;
        frameCounter = 0;
      }

      // 시뮬레이션 스텝 (speed 프레임마다 1회)
      if (running) {
        frameCounter++;
        const interval = Math.max(1, Math.floor(21 - speed));
        if (frameCounter % interval === 0) {
          step();
        }
      }

      // 화면에 표시
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);

      gl.useProgram(dispProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[currentFB]);
      gl.uniform1i(dispUState, 0);
      gl.uniform2f(dispURes, w, h);

      drawQuad(dispProg);
    },

    cleanup() {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      for (const t of textures) gl.deleteTexture(t);
      for (const f of framebuffers) gl.deleteFramebuffer(f);
      gl.deleteBuffer(quadBuf);
      gl.deleteProgram(simProg);
      gl.deleteProgram(dispProg);
    },
  };
}
