import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type Renderer } from "./types";

const PARTICLE_COUNT = 300;

const VERT = `
attribute vec2 a_position;
attribute float a_life;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  gl_PointSize = mix(1.0, 4.0, a_life);
}`;

const FRAG = `
precision mediump float;
varying float v_life;
uniform float u_dummy;
void main() {
  // 원형 포인트
  vec2 coord = gl_PointCoord - vec2(0.5);
  if (dot(coord, coord) > 0.25) discard;
  gl_FragColor = vec4(0.4, 0.7, 1.0, 1.0);
}`;

// varying 전달을 위해 쉐이더 수정
export const VERT_FINAL = `
attribute vec2 a_position;
attribute float a_life;
varying float v_life;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  gl_PointSize = mix(1.0, 5.0, a_life);
  v_life = a_life;
}`;

export const FRAG_FINAL = `
precision mediump float;
varying float v_life;
void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  if (dot(coord, coord) > 0.25) discard;
  vec3 color = mix(vec3(0.1, 0.3, 0.8), vec3(0.6, 0.9, 1.0), v_life);
  gl_FragColor = vec4(color, v_life);
}`;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

function spawnParticle(): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.0005 + Math.random() * 0.002;
  return {
    x: 0,
    y: 0,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    maxLife: 60 + Math.random() * 120,
  };
}

export function createParticlesRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT_FINAL, FRAG_FINAL);

  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = spawnParticle();
    // 초기 분산: 이미 진행된 상태로 시작
    const progress = Math.random();
    p.x += p.vx * p.maxLife * progress;
    p.y += p.vy * p.maxLife * progress;
    p.life = 1 - progress;
    particles.push(p);
  }

  // position(2) + life(1)
  const bufferData = new Float32Array(PARTICLE_COUNT * 3);
  const vbo = gl.createBuffer();

  const aPos = gl.getAttribLocation(program, "a_position");
  const aLife = gl.getAttribLocation(program, "a_life");
  const STRIDE = 3 * 4;

  return {
    render() {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      // 파티클 업데이트
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) {
          const newP = spawnParticle();
          particles[i] = newP;
          bufferData[i * 3] = newP.x;
          bufferData[i * 3 + 1] = newP.y;
          bufferData[i * 3 + 2] = newP.life;
        } else {
          bufferData[i * 3] = p.x;
          bufferData[i * 3 + 1] = p.y;
          bufferData[i * 3 + 2] = p.life;
        }
      }

      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.DYNAMIC_DRAW);

      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, STRIDE, 0);
      gl.enableVertexAttribArray(aLife);
      gl.vertexAttribPointer(aLife, 1, gl.FLOAT, false, STRIDE, 2 * 4);

      gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);

      gl.disable(gl.BLEND);
    },
    cleanup() {
      gl.deleteBuffer(vbo);
      gl.deleteProgram(program);
    },
  };
}
