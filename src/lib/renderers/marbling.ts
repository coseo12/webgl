import { createProgram, resizeCanvas, hexToRgb } from "@/lib/webgl";
import { type Renderer } from "./types";
import { type ParamValues } from "@/lib/params";

// --- 쉐이더 ---

/** 풀스크린 쿼드 버텍스 쉐이더 (모든 연산이 공유) */
export const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/**
 * Drop (잉크 드롭) — Lu & Jaffe 역변환
 * 중심 c에서 반지름 r 내부는 새 잉크 색상,
 * 외부는 sqrt(d²-r²)로 역매핑해 기존 텍스처 샘플링
 */
export const DROP_FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_center;
uniform float u_radius;
uniform vec3 u_inkColor;
uniform float u_aspect;

void main() {
  vec2 diff = v_uv - u_center;
  diff.x *= u_aspect;
  float dist = length(diff);

  if (dist < u_radius) {
    gl_FragColor = vec4(u_inkColor, 1.0);
  } else {
    float origDist = sqrt(dist * dist - u_radius * u_radius);
    vec2 dir = diff / dist;
    vec2 origDiff = dir * origDist;
    origDiff.x /= u_aspect;
    vec2 sampleUV = clamp(u_center + origDiff, vec2(0.0), vec2(1.0));
    gl_FragColor = texture2D(u_texture, sampleUV);
  }
}`;

/**
 * Tine (빗 끌기) — Lorentzian 감쇠
 * 선분 A→B 방향 변위, 수직 거리 d에 σ²/(d²+σ²) 감쇠
 * 변위량이 세그먼트 길이에 비례해 마우스 속도와 무관한 결과
 */
export const TINE_FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_start;
uniform vec2 u_end;
uniform float u_strength;
uniform float u_width;
uniform float u_aspect;

void main() {
  vec2 p = vec2(v_uv.x * u_aspect, v_uv.y);
  vec2 a = vec2(u_start.x * u_aspect, u_start.y);
  vec2 b = vec2(u_end.x * u_aspect, u_end.y);

  vec2 ab = b - a;
  float segLen = length(ab);

  if (segLen < 0.0001) {
    gl_FragColor = texture2D(u_texture, v_uv);
    return;
  }

  vec2 dir = ab / segLen;

  // 선분 위 최근점까지의 수직 거리
  float t = clamp(dot(p - a, dir), 0.0, segLen);
  vec2 closest = a + dir * t;
  float perpDist = length(p - closest);

  // Lorentzian 감쇠
  float w = u_width;
  float falloff = w * w / (perpDist * perpDist + w * w);

  // 변위가 세그먼트 벡터에 비례 (마우스 속도 독립적)
  vec2 disp = ab * u_strength * falloff;

  vec2 samplePos = p - disp;
  samplePos.x /= u_aspect;
  samplePos = clamp(samplePos, vec2(0.0), vec2(1.0));

  gl_FragColor = texture2D(u_texture, samplePos);
}`;

/**
 * Swirl (소용돌이) — 이차 감쇠 회전
 * 중심에서 거리 d에 따라 (1-d/R)² 감쇠로 회전 각도 결정
 */
export const SWIRL_FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_angle;
uniform float u_aspect;

void main() {
  vec2 diff = v_uv - u_center;
  diff.x *= u_aspect;
  float dist = length(diff);

  if (dist >= u_radius) {
    gl_FragColor = texture2D(u_texture, v_uv);
    return;
  }

  float factor = 1.0 - dist / u_radius;
  float angle = u_angle * factor * factor;

  float c = cos(-angle);
  float s = sin(-angle);
  vec2 rotated = vec2(
    diff.x * c - diff.y * s,
    diff.x * s + diff.y * c
  );
  rotated.x /= u_aspect;
  vec2 sampleUV = clamp(u_center + rotated, vec2(0.0), vec2(1.0));

  gl_FragColor = texture2D(u_texture, sampleUV);
}`;

const DISPLAY_FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}`;

// --- 연산 타입 ---

interface DropOp {
  type: "drop";
  center: [number, number];
  radius: number;
  color: [number, number, number];
}

interface TineOp {
  type: "tine";
  start: [number, number];
  end: [number, number];
  strength: number;
  width: number;
}

interface SwirlOp {
  type: "swirl";
  center: [number, number];
  radius: number;
  angle: number;
}

type Operation = DropOp | TineOp | SwirlOp;

// --- 렌더러 ---

export function createMarblingRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  // 쿼드 버퍼 (풀스크린 삼각형 2개)
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
    gl.STATIC_DRAW
  );

  // 프로그램 생성
  const dropProg = createProgram(gl, VERT, DROP_FRAG);
  const tineProg = createProgram(gl, VERT, TINE_FRAG);
  const swirlProg = createProgram(gl, VERT, SWIRL_FRAG);
  const displayProg = createProgram(gl, VERT, DISPLAY_FRAG);

  // 유니폼 캐시
  const dropU = {
    texture: gl.getUniformLocation(dropProg, "u_texture"),
    center: gl.getUniformLocation(dropProg, "u_center"),
    radius: gl.getUniformLocation(dropProg, "u_radius"),
    inkColor: gl.getUniformLocation(dropProg, "u_inkColor"),
    aspect: gl.getUniformLocation(dropProg, "u_aspect"),
  };
  const tineU = {
    texture: gl.getUniformLocation(tineProg, "u_texture"),
    start: gl.getUniformLocation(tineProg, "u_start"),
    end: gl.getUniformLocation(tineProg, "u_end"),
    strength: gl.getUniformLocation(tineProg, "u_strength"),
    width: gl.getUniformLocation(tineProg, "u_width"),
    aspect: gl.getUniformLocation(tineProg, "u_aspect"),
  };
  const swirlU = {
    texture: gl.getUniformLocation(swirlProg, "u_texture"),
    center: gl.getUniformLocation(swirlProg, "u_center"),
    radius: gl.getUniformLocation(swirlProg, "u_radius"),
    angle: gl.getUniformLocation(swirlProg, "u_angle"),
    aspect: gl.getUniformLocation(swirlProg, "u_aspect"),
  };
  const displayU = {
    texture: gl.getUniformLocation(displayProg, "u_texture"),
  };

  // 핑퐁 프레임버퍼
  const textures: WebGLTexture[] = [];
  const framebuffers: WebGLFramebuffer[] = [];
  let fbWidth = 0;
  let fbHeight = 0;
  let currentFB = 0;

  function createFBPair(w: number, h: number) {
    for (const t of textures) gl.deleteTexture(t);
    for (const f of framebuffers) gl.deleteFramebuffer(f);
    textures.length = 0;
    framebuffers.length = 0;

    for (let i = 0; i < 2; i++) {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0
      );

      textures.push(tex);
      framebuffers.push(fb);
    }

    // 흰색으로 초기화
    for (let i = 0; i < 2; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[i]);
      gl.viewport(0, 0, w, h);
      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    fbWidth = w;
    fbHeight = h;
    currentFB = 0;
  }

  function drawQuad(prog: WebGLProgram) {
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // 연산 적용 (핑퐁: 현재 텍스처 읽기 → 반대쪽 FB에 쓰기 → 스왑)
  function applyOp(op: Operation) {
    const readTex = textures[currentFB];
    const writeFB = framebuffers[1 - currentFB];
    const aspect = fbWidth / fbHeight;

    gl.bindFramebuffer(gl.FRAMEBUFFER, writeFB);
    gl.viewport(0, 0, fbWidth, fbHeight);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, readTex);

    if (op.type === "drop") {
      gl.useProgram(dropProg);
      gl.uniform1i(dropU.texture, 0);
      gl.uniform2f(dropU.center, op.center[0], op.center[1]);
      gl.uniform1f(dropU.radius, op.radius);
      gl.uniform3f(dropU.inkColor, op.color[0], op.color[1], op.color[2]);
      gl.uniform1f(dropU.aspect, aspect);
      drawQuad(dropProg);
    } else if (op.type === "tine") {
      gl.useProgram(tineProg);
      gl.uniform1i(tineU.texture, 0);
      gl.uniform2f(tineU.start, op.start[0], op.start[1]);
      gl.uniform2f(tineU.end, op.end[0], op.end[1]);
      gl.uniform1f(tineU.strength, op.strength);
      gl.uniform1f(tineU.width, op.width);
      gl.uniform1f(tineU.aspect, aspect);
      drawQuad(tineProg);
    } else {
      gl.useProgram(swirlProg);
      gl.uniform1i(swirlU.texture, 0);
      gl.uniform2f(swirlU.center, op.center[0], op.center[1]);
      gl.uniform1f(swirlU.radius, op.radius);
      gl.uniform1f(swirlU.angle, op.angle);
      gl.uniform1f(swirlU.aspect, aspect);
      drawQuad(swirlProg);
    }

    currentFB = 1 - currentFB;
  }

  // --- 마우스 인터랙션 ---

  const pendingOps: Operation[] = [];
  let isMouseDown = false;
  let lastMouseUV: [number, number] | null = null;
  let swirlCenter: [number, number] | null = null;
  let currentParams: ParamValues = {};

  function getUV(e: MouseEvent): [number, number] {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    return [x, y];
  }

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    isMouseDown = true;
    const uv = getUV(e);
    lastMouseUV = uv;

    const tool = (currentParams.tool as string) || "drop";
    if (tool === "drop") {
      const color = hexToRgb((currentParams.inkColor as string) || "#E63946");
      const radius = (currentParams.radius as number) || 0.08;
      pendingOps.push({ type: "drop", center: uv, radius, color });
    } else if (tool === "swirl") {
      swirlCenter = uv;
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isMouseDown || !lastMouseUV) return;
    const uv = getUV(e);
    const tool = (currentParams.tool as string) || "drop";

    if (tool === "tine") {
      const strength = (currentParams.strength as number) || 3;
      const width = (currentParams.radius as number) || 0.08;
      pendingOps.push({
        type: "tine",
        start: lastMouseUV,
        end: uv,
        strength,
        width,
      });
      lastMouseUV = uv;
    }
    // swirl은 render 루프에서 처리 (홀드 중 매 프레임 적용)
  };

  const onMouseUp = () => {
    isMouseDown = false;
    lastMouseUV = null;
    swirlCenter = null;
  };

  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  return {
    render(_time: number, params: ParamValues) {
      currentParams = params;

      resizeCanvas(canvas);
      const w = canvas.width;
      const h = canvas.height;

      // 프레임버퍼 크기가 달라지면 재생성 (리사이즈 시 초기화)
      if (w !== fbWidth || h !== fbHeight) {
        createFBPair(w, h);
      }

      // 소용돌이: 마우스 홀드 중 매 프레임 적용
      if (isMouseDown && swirlCenter) {
        const radius = (params.radius as number) || 0.08;
        const strength = (params.strength as number) || 3;
        pendingOps.push({
          type: "swirl",
          center: swirlCenter,
          radius: radius * 3,
          angle: strength * 0.02,
        });
      }

      // 대기 중인 연산 적용
      for (const op of pendingOps) {
        applyOp(op);
      }
      pendingOps.length = 0;

      // 화면에 현재 텍스처 표시
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[currentFB]);
      gl.useProgram(displayProg);
      gl.uniform1i(displayU.texture, 0);
      drawQuad(displayProg);
    },

    cleanup() {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      for (const t of textures) gl.deleteTexture(t);
      for (const f of framebuffers) gl.deleteFramebuffer(f);
      gl.deleteBuffer(quadBuf);
      gl.deleteProgram(dropProg);
      gl.deleteProgram(tineProg);
      gl.deleteProgram(swirlProg);
      gl.deleteProgram(displayProg);
    },
  };
}
