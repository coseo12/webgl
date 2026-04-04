import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type ParamValues } from "@/lib/params";
import { type Renderer } from "./types";

// --- 쉐이더 ---

const QUAD_VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FADE_FRAG = `
precision mediump float;
uniform float u_fadeAlpha;
void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, u_fadeAlpha);
}`;

/** 파티클: 질량 비례 크기, 개별 색상 */
export const VERT = `
attribute vec2 a_position;
attribute vec4 a_color;
attribute float a_size;
varying vec4 v_color;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  gl_PointSize = a_size;
  v_color = a_color;
}`;

export const FRAG = `
precision mediump float;
varying vec4 v_color;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = dot(c, c);
  if (d > 0.25) discard;
  // 중심이 밝은 방사형 그라데이션
  float glow = 1.0 - d * 4.0;
  gl_FragColor = v_color * glow;
}`;

/** 연결선 */
const LINE_VERT = `
attribute vec2 a_position;
attribute float a_alpha;
varying float v_alpha;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_alpha = a_alpha;
}`;

const LINE_FRAG = `
precision mediump float;
varying float v_alpha;
void main() {
  gl_FragColor = vec4(0.3, 0.6, 0.9, v_alpha * 0.3);
}`;

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

// --- 파티클 ---

const PARTICLE_COUNT = 100;
const SOFTENING = 0.01; // 특이점 방지
const LINE_DIST = 0.15; // 연결선 최대 거리

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  r: number;
  g: number;
  b: number;
}

function hslToRgb(h: number): [number, number, number] {
  const s = 0.75, l = 0.6;
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

function createBodies(): Body[] {
  const bodies: Body[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const radius = 0.2 + Math.random() * 0.15;
    const mass = 0.5 + Math.random();

    // 접선 방향 초기 속도 (원형 궤도 근사)
    const orbitalSpeed = 0.003 + Math.random() * 0.002;
    const [r, g, b] = hslToRgb(i / PARTICLE_COUNT);

    bodies.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      vx: -Math.sin(angle) * orbitalSpeed,
      vy: Math.cos(angle) * orbitalSpeed,
      mass,
      r, g, b,
    });
  }
  return bodies;
}

// --- 렌더러 ---

export function createMutualAttractionRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const fadeProg = createProgram(gl, QUAD_VERT, FADE_FRAG);
  const particleProg = createProgram(gl, VERT, FRAG);
  const lineProg = createProgram(gl, LINE_VERT, LINE_FRAG);
  const displayProg = createProgram(gl, DISPLAY_VERT, DISPLAY_FRAG);

  const fadeUAlpha = gl.getUniformLocation(fadeProg, "u_fadeAlpha");
  const dispUTex = gl.getUniformLocation(displayProg, "u_texture");

  // 쿼드 버퍼
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
    gl.STATIC_DRAW
  );

  // 파티클 버퍼: position(2) + color(4) + size(1) = 7 floats
  const particleBuf = gl.createBuffer();
  const particleData = new Float32Array(PARTICLE_COUNT * 7);
  const partAPos = gl.getAttribLocation(particleProg, "a_position");
  const partAColor = gl.getAttribLocation(particleProg, "a_color");
  const partASize = gl.getAttribLocation(particleProg, "a_size");
  const PART_STRIDE = 7 * 4;

  // 연결선 버퍼 (최대 연결 수 추정)
  const MAX_LINES = PARTICLE_COUNT * 10;
  const lineBuf = gl.createBuffer();
  const lineData = new Float32Array(MAX_LINES * 6); // per vertex: x, y, alpha
  const lineAPos = gl.getAttribLocation(lineProg, "a_position");
  const lineAAlpha = gl.getAttribLocation(lineProg, "a_alpha");
  const LINE_STRIDE = 3 * 4;

  // N-body 시스템
  let bodies = createBodies();

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

  // 마우스 어트랙터
  let attractorActive = false;
  let attractorX = 0;
  let attractorY = 0;

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    attractorActive = true;
    updateAttractor(e);
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!attractorActive) return;
    updateAttractor(e);
  };
  const onMouseUp = () => { attractorActive = false; };

  function updateAttractor(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    attractorX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    attractorY = (1 - (e.clientY - rect.top) / rect.height) * 2 - 1;
  }

  // 터치 지원
  function updateAttractorTouch(e: TouchEvent) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    attractorX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    attractorY = (1 - (touch.clientY - rect.top) / rect.height) * 2 - 1;
  }

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      attractorActive = true;
      updateAttractorTouch(e);
    }
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!attractorActive || e.touches.length !== 1) return;
    e.preventDefault();
    updateAttractorTouch(e);
  };
  const onTouchEnd = () => { attractorActive = false; };

  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: true });

  return {
    render(_time: number, params: ParamValues) {
      resizeCanvas(canvas);
      const w = canvas.width;
      const h = canvas.height;

      if (w !== fbWidth || h !== fbHeight) {
        createTrailFBO(w, h);
      }

      const gravity = (params.gravity as number) ?? 1;
      const damping = (params.damping as number) ?? 0.998;
      const trail = (params.trail as number) ?? 8;
      const showLines = (params.showLines as boolean) ?? true;
      const fadeAlpha = 0.2 / trail;
      const G = gravity * 0.00001;

      // --- N-body 물리 업데이트 (Velocity Verlet) ---
      const N = bodies.length;

      for (let i = 0; i < N; i++) {
        let fx = 0, fy = 0;
        const bi = bodies[i];

        // 다른 모든 파티클로부터의 인력
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          const bj = bodies[j];
          const dx = bj.x - bi.x;
          const dy = bj.y - bi.y;
          const distSq = dx * dx + dy * dy + SOFTENING;
          const force = G * bi.mass * bj.mass / distSq;
          const dist = Math.sqrt(distSq);
          fx += force * dx / dist;
          fy += force * dy / dist;
        }

        // 마우스 어트랙터
        if (attractorActive) {
          const dx = attractorX - bi.x;
          const dy = attractorY - bi.y;
          const distSq = dx * dx + dy * dy + SOFTENING;
          const force = G * bi.mass * 50 / distSq;
          const dist = Math.sqrt(distSq);
          fx += force * dx / dist;
          fy += force * dy / dist;
        }

        // 속도 및 위치 업데이트
        bi.vx = (bi.vx + fx / bi.mass) * damping;
        bi.vy = (bi.vy + fy / bi.mass) * damping;
        bi.x += bi.vx;
        bi.y += bi.vy;

        // 경계 반사 (부드러운 반발)
        if (bi.x < -1.2 || bi.x > 1.2) bi.vx *= -0.5;
        if (bi.y < -1.2 || bi.y > 1.2) bi.vy *= -0.5;
        bi.x = Math.max(-1.3, Math.min(1.3, bi.x));
        bi.y = Math.max(-1.3, Math.min(1.3, bi.y));
      }

      // --- 파티클 데이터 빌드 ---
      for (let i = 0; i < N; i++) {
        const b = bodies[i];
        const idx = i * 7;
        particleData[idx] = b.x;
        particleData[idx + 1] = b.y;
        particleData[idx + 2] = b.r;
        particleData[idx + 3] = b.g;
        particleData[idx + 4] = b.b;
        particleData[idx + 5] = 0.8;
        particleData[idx + 6] = 3 + b.mass * 5; // 질량 비례 크기
      }

      // --- 연결선 데이터 빌드 ---
      let lineVertCount = 0;
      if (showLines) {
        for (let i = 0; i < N && lineVertCount < MAX_LINES * 2; i++) {
          for (let j = i + 1; j < N; j++) {
            const dx = bodies[j].x - bodies[i].x;
            const dy = bodies[j].y - bodies[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < LINE_DIST) {
              const alpha = 1 - dist / LINE_DIST;
              const vi = lineVertCount * 3;
              lineData[vi] = bodies[i].x;
              lineData[vi + 1] = bodies[i].y;
              lineData[vi + 2] = alpha;
              lineData[vi + 3] = bodies[j].x;
              lineData[vi + 4] = bodies[j].y;
              lineData[vi + 5] = alpha;
              lineVertCount += 2;
              if (lineVertCount >= MAX_LINES * 2) break;
            }
          }
        }
      }

      // --- Trail FBO 렌더링 ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, trailFB);
      gl.viewport(0, 0, w, h);

      // 감쇄
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(fadeProg);
      gl.uniform1f(fadeUAlpha, fadeAlpha);
      drawQuad(fadeProg);

      // 가산 블렌딩으로 파티클 + 라인
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      // 연결선
      if (showLines && lineVertCount > 0) {
        gl.useProgram(lineProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          lineData.subarray(0, lineVertCount * 3),
          gl.DYNAMIC_DRAW
        );
        gl.enableVertexAttribArray(lineAPos);
        gl.vertexAttribPointer(lineAPos, 2, gl.FLOAT, false, LINE_STRIDE, 0);
        gl.enableVertexAttribArray(lineAAlpha);
        gl.vertexAttribPointer(lineAAlpha, 1, gl.FLOAT, false, LINE_STRIDE, 2 * 4);
        gl.drawArrays(gl.LINES, 0, lineVertCount);
      }

      // 파티클
      gl.useProgram(particleProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuf);
      gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(partAPos);
      gl.vertexAttribPointer(partAPos, 2, gl.FLOAT, false, PART_STRIDE, 0);
      gl.enableVertexAttribArray(partAColor);
      gl.vertexAttribPointer(partAColor, 4, gl.FLOAT, false, PART_STRIDE, 2 * 4);
      gl.enableVertexAttribArray(partASize);
      gl.vertexAttribPointer(partASize, 1, gl.FLOAT, false, PART_STRIDE, 6 * 4);
      gl.drawArrays(gl.POINTS, 0, N);

      gl.disable(gl.BLEND);

      // --- 화면 표시 ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.useProgram(displayProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, trailTex);
      gl.uniform1i(dispUTex, 0);
      drawQuad(displayProg);
    },

    cleanup() {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      if (trailTex) gl.deleteTexture(trailTex);
      if (trailFB) gl.deleteFramebuffer(trailFB);
      gl.deleteBuffer(quadBuf);
      gl.deleteBuffer(particleBuf);
      gl.deleteBuffer(lineBuf);
      gl.deleteProgram(fadeProg);
      gl.deleteProgram(particleProg);
      gl.deleteProgram(lineProg);
      gl.deleteProgram(displayProg);
    },
  };
}
