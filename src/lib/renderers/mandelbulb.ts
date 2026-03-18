import { createProgram, resizeCanvas } from "@/lib/webgl";
import { type Renderer } from "./types";
import { type ParamValues } from "@/lib/params";

// --- 쉐이더 ---

export const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export const FRAG = `
precision highp float;

uniform vec2 u_resolution;
uniform vec3 u_cameraPos;
uniform float u_power;
uniform int u_iterations;
uniform int u_colorScheme;

#define MAX_STEPS 80
#define MAX_ITER 16
#define MAX_DIST 10.0
#define SURF_DIST 0.0005
#define NORM_EPS 0.001

// 레이마칭 스텝 수 (AO 계산용)
float g_steps;

// Mandelbulb Distance Estimator
// 구면 좌표 반복으로 프랙탈 거리 추정
float mandelbulbDE(vec3 pos) {
  vec3 z = pos;
  float dr = 1.0;
  float r = 0.0;

  for (int i = 0; i < MAX_ITER; i++) {
    if (i >= u_iterations) break;
    r = length(z);
    if (r > 2.0) break;

    float theta = acos(z.z / r);
    float phi = atan(z.y, z.x);
    dr = pow(r, u_power - 1.0) * u_power * dr + 1.0;

    float zr = pow(r, u_power);
    theta *= u_power;
    phi *= u_power;

    z = zr * vec3(
      sin(theta) * cos(phi),
      sin(theta) * sin(phi),
      cos(theta)
    );
    z += pos;
  }

  return 0.5 * log(r) * r / dr;
}

// Orbit Trap — 반복 중 최소 반경, 색상 매핑에 활용
float mandelbulbTrap(vec3 pos) {
  vec3 z = pos;
  float r = 0.0;
  float trap = 1e10;

  for (int i = 0; i < MAX_ITER; i++) {
    if (i >= u_iterations) break;
    r = length(z);
    if (r > 2.0) break;

    trap = min(trap, r);

    float theta = acos(z.z / r);
    float phi = atan(z.y, z.x);
    float zr = pow(r, u_power);
    theta *= u_power;
    phi *= u_power;

    z = zr * vec3(
      sin(theta) * cos(phi),
      sin(theta) * sin(phi),
      cos(theta)
    );
    z += pos;
  }

  return clamp(trap / 1.5, 0.0, 1.0);
}

float rayMarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  g_steps = 0.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * t;
    float d = mandelbulbDE(p);
    if (d < SURF_DIST) return t;
    if (t > MAX_DIST) break;
    t += d;
    g_steps += 1.0;
  }

  return -1.0;
}

// 중심차분법 노멀 계산
vec3 getNormal(vec3 p) {
  vec2 e = vec2(NORM_EPS, 0.0);
  return normalize(vec3(
    mandelbulbDE(p + e.xyy) - mandelbulbDE(p - e.xyy),
    mandelbulbDE(p + e.yxy) - mandelbulbDE(p - e.yxy),
    mandelbulbDE(p + e.yyx) - mandelbulbDE(p - e.yyx)
  ));
}

// HSV hue → RGB
vec3 hsv2rgb(float h) {
  return clamp(
    abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
    0.0, 1.0
  );
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;

  // 카메라 기저 벡터 (원점을 바라봄)
  vec3 target = vec3(0.0);
  vec3 forward = normalize(target - u_cameraPos);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);

  vec3 rd = normalize(right * uv.x + up * uv.y + forward * 1.5);

  float t = rayMarch(u_cameraPos, rd);

  if (t < 0.0) {
    // 배경 그라데이션
    vec3 bg = mix(vec3(0.02, 0.02, 0.05), vec3(0.05, 0.05, 0.15), uv.y + 0.5);
    gl_FragColor = vec4(bg, 1.0);
    return;
  }

  vec3 p = u_cameraPos + rd * t;
  vec3 n = getNormal(p);
  float trap = mandelbulbTrap(p);

  // 라이팅: diffuse + specular + AO
  vec3 lightDir = normalize(vec3(0.5, 0.7, 1.0));
  float diff = max(dot(n, lightDir), 0.0);
  float spec = pow(max(dot(reflect(-lightDir, n), -rd), 0.0), 16.0);
  float ao = 1.0 - g_steps / float(MAX_STEPS);
  float light = (0.15 + diff * 0.7 + spec * 0.3) * ao;

  vec3 color;
  if (u_colorScheme == 0) {
    // 클래식: 흰/회색
    color = vec3(light);
  } else if (u_colorScheme == 1) {
    // 웜톤: 주황→노랑
    vec3 base = mix(vec3(0.8, 0.2, 0.05), vec3(1.0, 0.85, 0.3), trap);
    color = base * light;
  } else if (u_colorScheme == 2) {
    // 쿨톤: 남색→하늘색
    vec3 base = mix(vec3(0.1, 0.1, 0.5), vec3(0.4, 0.75, 1.0), trap);
    color = base * light;
  } else {
    // 사이키델릭: 무지개
    vec3 base = hsv2rgb(fract(trap * 3.0));
    color = base * light;
  }

  // 감마 보정
  color = pow(color, vec3(1.0 / 2.2));

  gl_FragColor = vec4(color, 1.0);
}`;

// --- 색상 테마 매핑 ---

const SCHEME_MAP: Record<string, number> = {
  classic: 0,
  warm: 1,
  cool: 2,
  psychedelic: 3,
};

// --- 렌더러 ---

export function createMandelbulbRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): Renderer {
  const program = createProgram(gl, VERT, FRAG);

  // 유니폼 캐시
  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const uCameraPos = gl.getUniformLocation(program, "u_cameraPos");
  const uPower = gl.getUniformLocation(program, "u_power");
  const uIterations = gl.getUniformLocation(program, "u_iterations");
  const uColorScheme = gl.getUniformLocation(program, "u_colorScheme");

  // 쿼드 버퍼
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
    gl.STATIC_DRAW
  );
  const aPos = gl.getAttribLocation(program, "a_position");

  // 궤도 카메라
  let azimuth = 0.5;
  let elevation = 0.3;
  let distance = 2.5;
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
    elevation = Math.max(
      -Math.PI / 2 + 0.05,
      Math.min(Math.PI / 2 - 0.05, elevation)
    );
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    distance += e.deltaY * 0.003;
    distance = Math.max(1.5, Math.min(6, distance));
  };

  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  return {
    render(_time: number, params: ParamValues) {
      resizeCanvas(canvas);
      const w = canvas.width;
      const h = canvas.height;

      const power = (params.power as number) ?? 8;
      const iterations = (params.iterations as number) ?? 8;
      const scheme =
        SCHEME_MAP[(params.colorScheme as string) || "classic"] ?? 0;
      const autoRotate = (params.autoRotate as boolean) ?? true;

      // 자동 회전
      if (autoRotate && !isDragging) {
        azimuth += 0.003;
      }

      // 카메라 위치 (구면 좌표 → 직교 좌표)
      const camX = distance * Math.cos(elevation) * Math.sin(azimuth);
      const camY = distance * Math.sin(elevation);
      const camZ = distance * Math.cos(elevation) * Math.cos(azimuth);

      gl.viewport(0, 0, w, h);
      gl.clearColor(0.02, 0.02, 0.05, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(uResolution, w, h);
      gl.uniform3f(uCameraPos, camX, camY, camZ);
      gl.uniform1f(uPower, power);
      gl.uniform1i(uIterations, iterations);
      gl.uniform1i(uColorScheme, scheme);

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },

    cleanup() {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      gl.deleteBuffer(quadBuf);
      gl.deleteProgram(program);
    },
  };
}
