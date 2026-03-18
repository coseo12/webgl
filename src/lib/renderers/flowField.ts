import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type ParamValues } from "@/lib/params";
import { type Renderer } from "./types";

// --- 쉐이더 ---

const QUAD_VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/** 잔상 감쇄: 반투명 검정 쿼드로 기존 내용을 어둡게 */
const FADE_FRAG = `
precision mediump float;
uniform float u_fadeAlpha;
void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, u_fadeAlpha);
}`;

/** 파티클 렌더링: 흐름 방향에 따른 색상 표현 */
export const VERT = `
attribute vec2 a_position;
attribute vec4 a_color;
varying vec4 v_color;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  gl_PointSize = 2.0;
  v_color = a_color;
}`;

export const FRAG = `
precision mediump float;
varying vec4 v_color;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  if (dot(c, c) > 0.25) discard;
  gl_FragColor = v_color;
}`;

/** 디스플레이: FBO 텍스처를 화면에 블릿 */
const DISPLAY_VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const DISPLAY_FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}`;

// --- Perlin Noise ---

const perm = new Uint8Array(512);
{
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function perlin(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = perm[perm[X] + Y];
  const ab = perm[perm[X] + Y + 1];
  const ba = perm[perm[X + 1] + Y];
  const bb = perm[perm[X + 1] + Y + 1];

  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v
  );
}

// --- HSL → RGB ---

function hslToRgb(h: number): [number, number, number] {
  const s = 0.7, l = 0.55;
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

// --- 파티클 ---

const PARTICLE_COUNT = 5000;

interface Particle {
  x: number; // [0, 1]
  y: number; // [0, 1]
}

function spawnParticle(): Particle {
  return { x: Math.random(), y: Math.random() };
}

// --- 렌더러 ---

export function createFlowFieldRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  // 프로그램 생성
  const fadeProg = createProgram(gl, QUAD_VERT, FADE_FRAG);
  const particleProg = createProgram(gl, VERT, FRAG);
  const displayProg = createProgram(gl, DISPLAY_VERT, DISPLAY_FRAG);

  // 유니폼 캐시
  const fadeUAlpha = gl.getUniformLocation(fadeProg, "u_fadeAlpha");
  const dispUTex = gl.getUniformLocation(displayProg, "u_texture");

  // 쿼드 버퍼 (fade & display 공유)
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
    gl.STATIC_DRAW
  );

  // 파티클 버퍼: position(2) + color(4) = 6 floats per particle
  const particleBuf = gl.createBuffer();
  const particleData = new Float32Array(PARTICLE_COUNT * 6);

  const partAPos = gl.getAttribLocation(particleProg, "a_position");
  const partAColor = gl.getAttribLocation(particleProg, "a_color");
  const PART_STRIDE = 6 * 4;

  // 파티클 초기화
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(spawnParticle());
  }

  // Trail FBO
  let trailTex: WebGLTexture | null = null;
  let trailFB: WebGLFramebuffer | null = null;
  let fbWidth = 0;
  let fbHeight = 0;

  function createTrailFBO(w: number, h: number) {
    if (trailTex) gl.deleteTexture(trailTex);
    if (trailFB) gl.deleteFramebuffer(trailFB);

    trailTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, trailTex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    trailFB = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, trailFB);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, trailTex, 0
    );

    // 검정으로 초기화
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    fbWidth = w;
    fbHeight = h;
  }

  function drawQuad(prog: WebGLProgram) {
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  return {
    render(time: number, params: ParamValues) {
      resizeCanvas(canvas);
      const w = canvas.width;
      const h = canvas.height;

      if (w !== fbWidth || h !== fbHeight) {
        createTrailFBO(w, h);
      }

      const speed = (params.speed as number) ?? 1;
      const noiseScale = (params.noiseScale as number) ?? 2;
      const trail = (params.trail as number) ?? 10;
      const colorMode = (params.colorMode as string) || "flow";

      // 잔상 감쇄량: trail 높을수록 오래 유지
      const fadeAlpha = 0.2 / trail;

      // 시간 기반 노이즈 진화 (느리게)
      const noiseTime = time * 0.00008;

      // --- 파티클 업데이트 ---
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        // Perlin noise → 흐름 각도
        const angle =
          perlin(p.x * noiseScale, p.y * noiseScale + noiseTime) *
          Math.PI * 2;

        // 속도 벡터
        const vx = Math.cos(angle) * 0.002 * speed;
        const vy = Math.sin(angle) * 0.002 * speed;

        p.x += vx;
        p.y += vy;

        // 경계 이탈 시 재생성
        if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) {
          p.x = Math.random();
          p.y = Math.random();
        }

        // 클립 스페이스 변환
        const clipX = p.x * 2 - 1;
        const clipY = p.y * 2 - 1;

        // 색상 결정
        let r: number, g: number, b: number, a: number;
        if (colorMode === "rainbow") {
          [r, g, b] = hslToRgb(p.x);
          a = 0.7;
        } else if (colorMode === "mono") {
          r = 0.3; g = 0.8; b = 1.0; a = 0.6;
        } else {
          // flow: 흐름 각도 기반 색상
          const hue = ((angle / (Math.PI * 2)) % 1 + 1) % 1;
          [r, g, b] = hslToRgb(hue);
          a = 0.7;
        }

        const idx = i * 6;
        particleData[idx] = clipX;
        particleData[idx + 1] = clipY;
        particleData[idx + 2] = r;
        particleData[idx + 3] = g;
        particleData[idx + 4] = b;
        particleData[idx + 5] = a;
      }

      // --- Trail FBO에 렌더링 ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, trailFB);
      gl.viewport(0, 0, w, h);

      // 1) 잔상 감쇄: 반투명 검정 쿼드
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(fadeProg);
      gl.uniform1f(fadeUAlpha, fadeAlpha);
      drawQuad(fadeProg);

      // 2) 파티클 렌더링 (가산 블렌딩)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.useProgram(particleProg);

      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuf);
      gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.DYNAMIC_DRAW);

      gl.enableVertexAttribArray(partAPos);
      gl.vertexAttribPointer(partAPos, 2, gl.FLOAT, false, PART_STRIDE, 0);
      gl.enableVertexAttribArray(partAColor);
      gl.vertexAttribPointer(partAColor, 4, gl.FLOAT, false, PART_STRIDE, 2 * 4);

      gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);
      gl.disable(gl.BLEND);

      // --- 화면에 표시 ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);

      gl.useProgram(displayProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, trailTex);
      gl.uniform1i(dispUTex, 0);
      drawQuad(displayProg);
    },

    cleanup() {
      if (trailTex) gl.deleteTexture(trailTex);
      if (trailFB) gl.deleteFramebuffer(trailFB);
      gl.deleteBuffer(quadBuf);
      gl.deleteBuffer(particleBuf);
      gl.deleteProgram(fadeProg);
      gl.deleteProgram(particleProg);
      gl.deleteProgram(displayProg);
    },
  };
}
