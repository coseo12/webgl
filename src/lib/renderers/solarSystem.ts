import { createProgram, resizeCanvas } from "@/lib/webgl";
import * as mat from "@/lib/matrix";
import { type Renderer } from "./types";
import { type ParamValues } from "@/lib/params";

// --- 쉐이더 ---

export const VERT = `
attribute vec3 a_position;
attribute vec3 a_normal;
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
varying vec3 v_normal;
varying vec3 v_worldPos;
void main() {
  vec4 worldPos = u_model * vec4(a_position, 1.0);
  v_worldPos = worldPos.xyz;
  v_normal = mat3(u_model) * a_normal;
  gl_Position = u_projection * u_view * worldPos;
}`;

export const FRAG = `
precision mediump float;
varying vec3 v_normal;
varying vec3 v_worldPos;
uniform vec3 u_color;
uniform vec3 u_lightPosition;
uniform bool u_emissive;
void main() {
  if (u_emissive) {
    gl_FragColor = vec4(u_color, 1.0);
    return;
  }
  vec3 normal = normalize(v_normal);
  vec3 lightDir = normalize(u_lightPosition - v_worldPos);
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 ambient = vec3(0.1);
  vec3 color = u_color * (ambient + vec3(1.0, 0.98, 0.9) * diff);
  gl_FragColor = vec4(color, 1.0);
}`;

// 궤도 라인용 쉐이더
const ORBIT_VERT = `
attribute vec3 a_position;
uniform mat4 u_view;
uniform mat4 u_projection;
void main() {
  gl_Position = u_projection * u_view * vec4(a_position, 1.0);
}`;

const ORBIT_FRAG = `
precision mediump float;
void main() {
  gl_FragColor = vec4(0.4, 0.4, 0.4, 0.5);
}`;

// --- 구(sphere) 메시 생성 ---

interface SphereMesh {
  vertices: Float32Array; // position(3) + normal(3)
  indices: Uint16Array;
  indexCount: number;
}

function createSphere(latSegments: number, lonSegments: number): SphereMesh {
  const verts: number[] = [];
  const idx: number[] = [];

  for (let lat = 0; lat <= latSegments; lat++) {
    const theta = (lat * Math.PI) / latSegments;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    for (let lon = 0; lon <= lonSegments; lon++) {
      const phi = (lon * 2 * Math.PI) / lonSegments;
      const x = sinT * Math.cos(phi);
      const y = cosT;
      const z = sinT * Math.sin(phi);
      // position과 normal이 동일 (단위 구)
      verts.push(x, y, z, x, y, z);
    }
  }

  for (let lat = 0; lat < latSegments; lat++) {
    for (let lon = 0; lon < lonSegments; lon++) {
      const a = lat * (lonSegments + 1) + lon;
      const b = a + lonSegments + 1;
      idx.push(a, b, a + 1);
      idx.push(b, b + 1, a + 1);
    }
  }

  return {
    vertices: new Float32Array(verts),
    indices: new Uint16Array(idx),
    indexCount: idx.length,
  };
}

// --- 궤도 원형 라인 생성 ---

function createOrbitCircle(radius: number, segments: number): Float32Array {
  const verts: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i * 2 * Math.PI) / segments;
    verts.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }
  return new Float32Array(verts);
}

// --- 천체 정의 ---

interface CelestialBody {
  name: string;
  orbitRadius: number;
  size: number;
  orbitSpeed: number; // 공전 속도 배율
  rotationSpeed: number; // 자전 속도
  color: [number, number, number];
  emissive: boolean;
}

const SUN: CelestialBody = {
  name: "sun",
  orbitRadius: 0,
  size: 1.0,
  orbitSpeed: 0,
  rotationSpeed: 0.2,
  color: [1.0, 0.85, 0.2],
  emissive: true,
};

const PLANETS: CelestialBody[] = [
  {
    name: "mercury",
    orbitRadius: 3,
    size: 0.2,
    orbitSpeed: 4.0,
    rotationSpeed: 0.5,
    color: [0.7, 0.65, 0.6],
    emissive: false,
  },
  {
    name: "venus",
    orbitRadius: 4.5,
    size: 0.35,
    orbitSpeed: 2.5,
    rotationSpeed: 0.3,
    color: [0.9, 0.75, 0.4],
    emissive: false,
  },
  {
    name: "earth",
    orbitRadius: 6,
    size: 0.4,
    orbitSpeed: 1.5,
    rotationSpeed: 2.0,
    color: [0.2, 0.5, 0.9],
    emissive: false,
  },
  {
    name: "mars",
    orbitRadius: 8,
    size: 0.3,
    orbitSpeed: 1.0,
    rotationSpeed: 1.8,
    color: [0.85, 0.35, 0.15],
    emissive: false,
  },
];

// --- 렌더러 ---

export function createSolarSystemRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  // 메인 프로그램 (천체 렌더링)
  const program = createProgram(gl, VERT, FRAG);
  const uModel = gl.getUniformLocation(program, "u_model");
  const uView = gl.getUniformLocation(program, "u_view");
  const uProjection = gl.getUniformLocation(program, "u_projection");
  const uColor = gl.getUniformLocation(program, "u_color");
  const uLightPos = gl.getUniformLocation(program, "u_lightPosition");
  const uEmissive = gl.getUniformLocation(program, "u_emissive");
  const aPos = gl.getAttribLocation(program, "a_position");
  const aNormal = gl.getAttribLocation(program, "a_normal");

  // 궤도 라인 프로그램
  const orbitProgram = createProgram(gl, ORBIT_VERT, ORBIT_FRAG);
  const orbitUView = gl.getUniformLocation(orbitProgram, "u_view");
  const orbitUProj = gl.getUniformLocation(orbitProgram, "u_projection");
  const orbitAPos = gl.getAttribLocation(orbitProgram, "a_position");

  // 구 메시 (모든 천체가 공유, 스케일로 크기 조절)
  const sphere = createSphere(24, 32);
  const sphereVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVbo);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW);
  const sphereIbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

  // 궤도 라인 버퍼 (행성별)
  const ORBIT_SEGMENTS = 128;
  const orbitBuffers = PLANETS.map((p) => {
    const verts = createOrbitCircle(p.orbitRadius, ORBIT_SEGMENTS);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    return buf;
  });

  const STRIDE = 6 * 4; // position(3) + normal(3), float = 4 bytes

  // 궤도 카메라 상태
  let azimuth = 0.4; // 수평 각도
  let elevation = 0.6; // 수직 각도
  let distance = 20; // 카메라 거리
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    azimuth -= dx * 0.005;
    elevation += dy * 0.005;
    // 수직 각도 제한 (완전한 뒤집힘 방지)
    elevation = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, elevation));
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    distance += e.deltaY * 0.02;
    distance = Math.max(5, Math.min(50, distance));
  };

  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  // 천체 하나를 렌더링하는 헬퍼
  function drawBody(
    body: CelestialBody,
    time: number,
    speedMultiplier: number,
    view: mat.Mat4,
    proj: mat.Mat4
  ) {
    let model = mat.identity();

    if (body.orbitRadius > 0) {
      // 공전: Y축 기준 회전 후 공전 반경만큼 이동
      const orbitAngle = time * 0.0003 * body.orbitSpeed * speedMultiplier;
      model = mat.rotateY(model, orbitAngle);
      model = mat.translate(model, body.orbitRadius, 0, 0);
    }

    // 자전
    const selfRotation = time * 0.001 * body.rotationSpeed * speedMultiplier;
    model = mat.rotateY(model, selfRotation);

    // 스케일
    model = mat.scale(model, body.size, body.size, body.size);

    gl.useProgram(program);
    gl.uniformMatrix4fv(uModel, false, model);
    gl.uniformMatrix4fv(uView, false, view);
    gl.uniformMatrix4fv(uProjection, false, proj);
    gl.uniform3f(uColor, body.color[0], body.color[1], body.color[2]);
    gl.uniform3f(uLightPos, 0, 0, 0); // 태양 위치
    gl.uniform1i(uEmissive, body.emissive ? 1 : 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVbo);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, STRIDE, 0);
    gl.enableVertexAttribArray(aNormal);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, STRIDE, 3 * 4);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIbo);
    gl.drawElements(gl.TRIANGLES, sphere.indexCount, gl.UNSIGNED_SHORT, 0);
  }

  // 궤도 라인 렌더링
  function drawOrbits(view: mat.Mat4, proj: mat.Mat4) {
    gl.useProgram(orbitProgram);
    gl.uniformMatrix4fv(orbitUView, false, view);
    gl.uniformMatrix4fv(orbitUProj, false, proj);

    for (let i = 0; i < orbitBuffers.length; i++) {
      gl.bindBuffer(gl.ARRAY_BUFFER, orbitBuffers[i]);
      gl.enableVertexAttribArray(orbitAPos);
      gl.vertexAttribPointer(orbitAPos, 3, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINE_LOOP, 0, ORBIT_SEGMENTS + 1);
    }
  }

  return {
    render(time: number, params: ParamValues) {
      const speed = (params.speed as number) ?? 1;
      const showOrbits = (params.showOrbits as boolean) ?? true;
      const autoRotate = (params.autoRotate as boolean) ?? false;

      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.02, 0.02, 0.05, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      // 자동 회전 시 azimuth를 천천히 증가
      if (autoRotate && !isDragging) {
        azimuth += 0.002;
      }

      // 카메라 위치 계산 (구면 좌표 → 직교 좌표)
      const camX = distance * Math.cos(elevation) * Math.sin(azimuth);
      const camY = distance * Math.sin(elevation);
      const camZ = distance * Math.cos(elevation) * Math.cos(azimuth);

      const aspect = canvas.width / canvas.height;
      const proj = mat.perspective(Math.PI / 4, aspect, 0.1, 200);
      const view = mat.lookAt([camX, camY, camZ], [0, 0, 0], [0, 1, 0]);

      // 궤도 라인 (반투명이므로 먼저 렌더링)
      if (showOrbits) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        drawOrbits(view, proj);
        gl.disable(gl.BLEND);
      }

      // 태양
      drawBody(SUN, time, speed, view, proj);

      // 행성들
      for (const planet of PLANETS) {
        drawBody(planet, time, speed, view, proj);
      }
    },

    cleanup() {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      gl.deleteBuffer(sphereVbo);
      gl.deleteBuffer(sphereIbo);
      for (const buf of orbitBuffers) {
        gl.deleteBuffer(buf);
      }
      gl.deleteProgram(program);
      gl.deleteProgram(orbitProgram);
    },
  };
}
