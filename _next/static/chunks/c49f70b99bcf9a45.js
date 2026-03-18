(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,34261,e=>{"use strict";var t=e.i(43476),r=e.i(71645);function o(e,t,r){let o=e.createShader(t);if(!o)throw Error("쉐이더 생성 실패");if(e.shaderSource(o,r),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(o);throw e.deleteShader(o),Error(`쉐이더 컴파일 에러: ${t}`)}return o}function a(e,t,r){let a=o(e,e.VERTEX_SHADER,t),i=o(e,e.FRAGMENT_SHADER,r),n=e.createProgram();if(!n)throw Error("프로그램 생성 실패");if(e.attachShader(n,a),e.attachShader(n,i),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS)){let t=e.getProgramInfoLog(n);throw e.deleteProgram(n),Error(`프로그램 링크 에러: ${t}`)}return e.deleteShader(a),e.deleteShader(i),n}function i(e){let t=window.devicePixelRatio||1,r=Math.floor(e.clientWidth*t),o=Math.floor(e.clientHeight*t);return(e.width!==r||e.height!==o)&&(e.width=r,e.height=o,!0)}function n(e){return[parseInt(e.slice(1,3),16)/255,parseInt(e.slice(3,5),16)/255,parseInt(e.slice(5,7),16)/255]}let l=`
attribute vec2 a_position;
attribute vec3 a_color;
varying vec3 v_color;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_color = a_color;
}`,u=`
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`,c=`
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,f=`
precision mediump float;
void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}`,s=`
attribute vec2 a_position;
attribute vec3 a_color;
varying vec3 v_color;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_color = a_color;
}`,d=`
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`,_=`
attribute vec2 a_position;
uniform vec2 u_translation;
void main() {
  gl_Position = vec4(a_position + u_translation, 0.0, 1.0);
}`,m=`
precision mediump float;
void main() {
  gl_FragColor = vec4(0.3, 0.7, 1.0, 1.0);
}`,v=`
attribute vec2 a_position;
attribute vec3 a_color;
uniform float u_angle;
varying vec3 v_color;
void main() {
  float c = cos(u_angle);
  float s = sin(u_angle);
  vec2 rotated = vec2(
    a_position.x * c - a_position.y * s,
    a_position.x * s + a_position.y * c
  );
  gl_Position = vec4(rotated, 0.0, 1.0);
  v_color = a_color;
}`,A=`
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`,g=`
attribute vec2 a_position;
attribute vec3 a_color;
uniform float u_scale;
varying vec3 v_color;
void main() {
  gl_Position = vec4(a_position * u_scale, 0.0, 1.0);
  v_color = a_color;
}`,E=`
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`;function R(){let e=new Float32Array(16);return e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function b(e,t,r,o){let a=new Float32Array(16),i=1/Math.tan(e/2),n=1/(r-o);return a[0]=i/t,a[5]=i,a[10]=(r+o)*n,a[11]=-1,a[14]=2*r*o*n,a}function T(e,t,r,o){let a=new Float32Array(e);return a[12]=e[0]*t+e[4]*r+e[8]*o+e[12],a[13]=e[1]*t+e[5]*r+e[9]*o+e[13],a[14]=e[2]*t+e[6]*r+e[10]*o+e[14],a[15]=e[3]*t+e[7]*r+e[11]*o+e[15],a}function x(e,t){let r=new Float32Array(e),o=Math.cos(t),a=Math.sin(t),i=e[4],n=e[5],l=e[6],u=e[7],c=e[8],f=e[9],s=e[10],d=e[11];return r[4]=i*o+c*a,r[5]=n*o+f*a,r[6]=l*o+s*a,r[7]=u*o+d*a,r[8]=c*o-i*a,r[9]=f*o-n*a,r[10]=s*o-l*a,r[11]=d*o-u*a,r}function p(e,t){let r=new Float32Array(e),o=Math.cos(t),a=Math.sin(t),i=e[0],n=e[1],l=e[2],u=e[3],c=e[8],f=e[9],s=e[10],d=e[11];return r[0]=i*o-c*a,r[1]=n*o-f*a,r[2]=l*o-s*a,r[3]=u*o-d*a,r[8]=i*a+c*o,r[9]=n*a+f*o,r[10]=l*a+s*o,r[11]=u*a+d*o,r}function h(e,t){let r=new Float32Array(16);for(let o=0;o<4;o++)for(let a=0;a<4;a++)r[4*a+o]=e[o]*t[4*a]+e[4+o]*t[4*a+1]+e[8+o]*t[4*a+2]+e[12+o]*t[4*a+3];return r}let F=`
attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 u_mvp;
varying vec3 v_color;
void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
  v_color = a_color;
}`,y=`
precision mediump float;
varying vec3 v_color;
uniform vec3 u_ambientColor;
uniform float u_ambientIntensity;
void main() {
  vec3 ambient = u_ambientColor * u_ambientIntensity;
  gl_FragColor = vec4(v_color * ambient, 1.0);
}`,U=`
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
uniform mat4 u_mvp;
uniform mat4 u_model;
varying vec3 v_normal;
varying vec3 v_color;
void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
  // 노멀 변환 (단순 회전만 있으므로 모델 행렬 사용)
  v_normal = mat3(u_model) * a_normal;
  v_color = a_color;
}`,B=`
precision mediump float;
varying vec3 v_normal;
varying vec3 v_color;
uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
void main() {
  vec3 normal = normalize(v_normal);
  float diff = max(dot(normal, normalize(u_lightDir)), 0.0);
  vec3 ambient = vec3(0.15);
  vec3 color = v_color * (ambient + u_lightColor * diff);
  gl_FragColor = vec4(color, 1.0);
}`,L=`
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}`,w=`
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_texCoord);
}`,P=`
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,D=`
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float r = 0.5 + 0.5 * sin(u_time);
  float g = 0.5 + 0.5 * sin(u_time + 2.094);
  float b = 0.5 + 0.5 * sin(u_time + 4.189);
  gl_FragColor = vec4(r, g, b, 1.0);
}`,M=`
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float r = uv.x * (0.5 + 0.5 * sin(u_time * 0.7));
  float g = uv.y * (0.5 + 0.5 * cos(u_time * 0.5));
  float b = (uv.x + uv.y) * 0.5 * (0.5 + 0.5 * sin(u_time * 0.3));
  gl_FragColor = vec4(r, g, b, 1.0);
}`,S=`
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

// 심플렉스 기반 2D 해시
vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution * 4.0;
  float n = noise(uv + u_time * 0.3) * 0.5 + 0.5;
  float n2 = noise(uv * 2.0 - u_time * 0.2) * 0.5 + 0.5;
  vec3 color = vec3(n * 0.4, n2 * 0.6, (n + n2) * 0.35);
  gl_FragColor = vec4(color, 1.0);
}`,C={default:D,gradient:M,noise:S},N=new Float32Array([-1,-1,1,-1,1,1,-1,1]),I=new Uint16Array([0,1,2,0,2,3]),O=`
attribute vec2 a_position;
attribute float a_life;
varying float v_life;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  gl_PointSize = mix(1.0, 5.0, a_life);
  v_life = a_life;
}`,Y=`
precision mediump float;
varying float v_life;
void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  if (dot(coord, coord) > 0.25) discard;
  vec3 color = mix(vec3(0.1, 0.3, 0.8), vec3(0.6, 0.9, 1.0), v_life);
  gl_FragColor = vec4(color, v_life);
}`;function X(){let e=Math.random()*Math.PI*2,t=5e-4+.002*Math.random();return{x:0,y:0,vx:Math.cos(e)*t,vy:Math.sin(e)*t,life:1,maxLife:60+120*Math.random()}}let k=`
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
}`,G=`
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
}`,V=`
attribute vec3 a_position;
uniform mat4 u_view;
uniform mat4 u_projection;
void main() {
  gl_Position = u_projection * u_view * vec4(a_position, 1.0);
}`,j=`
precision mediump float;
void main() {
  gl_FragColor = vec4(0.4, 0.4, 0.4, 0.5);
}`,W={name:"sun",orbitRadius:0,size:1,orbitSpeed:0,rotationSpeed:.2,color:[1,.85,.2],emissive:!0},z=[{name:"mercury",orbitRadius:3,size:.2,orbitSpeed:4,rotationSpeed:.5,color:[.7,.65,.6],emissive:!1},{name:"venus",orbitRadius:4.5,size:.35,orbitSpeed:2.5,rotationSpeed:.3,color:[.9,.75,.4],emissive:!1},{name:"earth",orbitRadius:6,size:.4,orbitSpeed:1.5,rotationSpeed:2,color:[.2,.5,.9],emissive:!1},{name:"mars",orbitRadius:8,size:.3,orbitSpeed:1,rotationSpeed:1.8,color:[.85,.35,.15],emissive:!1}],H=`
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,q=`
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
}`,$=`
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
}`,K=`
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
}`,J=`
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}`,Z=`
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,Q=`
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}`,ee=`
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,et=`
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
}`,er={classic:0,warm:1,cool:2,psychedelic:3},eo=`
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,ea=`
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
}`,ei=`
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
}`;function en(){let e=new Uint8Array(262144);for(let t=0;t<e.length;t+=4)e[t+3]=255;return e}function el(e,t,r,o){for(let[a,i]of t)!function(e,t,r){let o=((r%256+256)%256*256+(t%256+256)%256)*4;e[o]=255,e[o+1]=255,e[o+2]=255}(e,r+a,o+i)}let eu=[[1,0],[2,1],[0,2],[1,2],[2,2]],ec=[[24,0],[22,1],[24,1],[12,2],[13,2],[20,2],[21,2],[34,2],[35,2],[11,3],[15,3],[20,3],[21,3],[34,3],[35,3],[0,4],[1,4],[10,4],[16,4],[20,4],[21,4],[0,5],[1,5],[10,5],[14,5],[16,5],[17,5],[22,5],[24,5],[10,6],[16,6],[24,6],[11,7],[15,7],[12,8],[13,8]],ef=(()=>{let e=[];for(let[t,r]of[[2,1],[3,1],[4,1],[1,2],[1,3],[1,4],[2,6],[3,6],[4,6],[6,2],[6,3],[6,4]])e.push([t,r],[-t,r],[t,-r],[-t,-r]);return e})(),es=[[1,0],[4,0],[0,1],[0,2],[4,2],[0,3],[1,3],[2,3],[3,3]],ed=`
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,e_=`
precision mediump float;
uniform float u_fadeAlpha;
void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, u_fadeAlpha);
}`,em=`
attribute vec2 a_position;
attribute vec4 a_color;
varying vec4 v_color;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  gl_PointSize = 2.0;
  v_color = a_color;
}`,ev=`
precision mediump float;
varying vec4 v_color;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  if (dot(c, c) > 0.25) discard;
  gl_FragColor = v_color;
}`,eA=`
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,eg=`
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}`,eE=new Uint8Array(512);{let e=Array.from({length:256},(e,t)=>t);for(let t=255;t>0;t--){let r=Math.floor(Math.random()*(t+1));[e[t],e[r]]=[e[r],e[t]]}for(let t=0;t<512;t++)eE[t]=e[255&t]}function eR(e){return e*e*e*(e*(6*e-15)+10)}function eb(e,t,r){let o=3&e,a=o<2?t:r,i=o<2?r:t;return((1&o)==0?a:-a)+((2&o)==0?i:-i)}function eT(e){let t=(1-Math.abs(1.1-1))*.7,r=t*(1-Math.abs(6*e%2-1)),o=.55-t/2,[a,i,n]=[[t,r,0],[r,t,0],[0,t,r],[0,r,t],[r,0,t],[t,0,r]][Math.floor(6*e)%6];return[a+o,i+o,n+o]}let ex=`
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,ep=`
precision mediump float;
uniform float u_fadeAlpha;
void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, u_fadeAlpha);
}`,eh=`
attribute vec2 a_position;
attribute vec4 a_color;
attribute float a_size;
varying vec4 v_color;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  gl_PointSize = a_size;
  v_color = a_color;
}`,eF=`
precision mediump float;
varying vec4 v_color;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = dot(c, c);
  if (d > 0.25) discard;
  // 중심이 밝은 방사형 그라데이션
  float glow = 1.0 - d * 4.0;
  gl_FragColor = v_color * glow;
}`,ey=`
attribute vec2 a_position;
attribute float a_alpha;
varying float v_alpha;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_alpha = a_alpha;
}`,eU=`
precision mediump float;
varying float v_alpha;
void main() {
  gl_FragColor = vec4(0.3, 0.6, 0.9, v_alpha * 0.3);
}`,eB=`
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,eL=`
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}`,ew=`
attribute vec2 a_position;
attribute vec3 a_color;
varying vec3 v_color;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_color = a_color;
}`,eP=`
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`,eD=`
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,eM=`
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}`,eS=[[-.2,.15,.9,.2,.2],[.2,.15,.2,.9,.2],[0,-.2,.2,.2,.9]],eC=`
attribute vec2 a_position;
attribute vec3 a_color;
uniform mat3 u_matrix;
varying vec3 v_color;
void main() {
  vec3 pos = u_matrix * vec3(a_position, 1.0);
  gl_Position = vec4(pos.xy, 0.0, 1.0);
  v_color = a_color;
}`,eN=`
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`,eI=`
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
uniform mat4 u_mvp;
uniform mat4 u_model;
varying vec3 v_normal;
varying vec3 v_worldPos;
varying vec3 v_color;
void main() {
  vec4 worldPos = u_model * vec4(a_position, 1.0);
  v_worldPos = worldPos.xyz;
  gl_Position = u_mvp * vec4(a_position, 1.0);
  v_normal = mat3(u_model) * a_normal;
  v_color = a_color;
}`,eO=`
precision mediump float;
varying vec3 v_normal;
varying vec3 v_worldPos;
varying vec3 v_color;
uniform vec3 u_lightDir;
uniform vec3 u_viewPos;
uniform float u_shininess;
uniform float u_specularIntensity;
void main() {
  vec3 normal = normalize(v_normal);
  vec3 lightDir = normalize(u_lightDir);
  vec3 viewDir = normalize(u_viewPos - v_worldPos);

  // Ambient
  vec3 ambient = vec3(0.15);

  // Diffuse (Lambert)
  float diff = max(dot(normal, lightDir), 0.0);

  // Specular (Phong)
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow(max(dot(reflectDir, viewDir), 0.0), u_shininess);

  vec3 color = v_color * (ambient + vec3(1.0, 0.98, 0.9) * diff)
             + vec3(1.0) * spec * u_specularIntensity;
  gl_FragColor = vec4(color, 1.0);
}`,eY=`
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
uniform mat4 u_mvp;
uniform mat4 u_model;
varying vec3 v_normal;
varying vec3 v_worldPos;
varying vec3 v_color;
void main() {
  vec4 worldPos = u_model * vec4(a_position, 1.0);
  v_worldPos = worldPos.xyz;
  gl_Position = u_mvp * vec4(a_position, 1.0);
  v_normal = mat3(u_model) * a_normal;
  v_color = a_color;
}`,eX=`
precision mediump float;
varying vec3 v_normal;
varying vec3 v_worldPos;
varying vec3 v_color;
uniform vec3 u_lightPos;
uniform vec3 u_lightColor;
uniform float u_attenuation;
void main() {
  vec3 normal = normalize(v_normal);
  vec3 lightVec = u_lightPos - v_worldPos;
  float dist = length(lightVec);
  vec3 lightDir = lightVec / dist;

  // 거리 감쇠
  float atten = 1.0 / (1.0 + u_attenuation * dist * dist);

  // Ambient + Diffuse
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 ambient = vec3(0.1);
  vec3 color = v_color * (ambient + u_lightColor * diff * atten);
  gl_FragColor = vec4(color, 1.0);
}`,ek=`
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}`,eG=`
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_textureA;
uniform sampler2D u_textureB;
uniform float u_mixRatio;
void main() {
  vec4 colorA = texture2D(u_textureA, v_texCoord);
  vec4 colorB = texture2D(u_textureB, v_texCoord);
  gl_FragColor = mix(colorA, colorB, u_mixRatio);
}`;function eV(e,t){let r=e.createTexture();return e.bindTexture(e.TEXTURE_2D,r),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,8,8,0,e.RGBA,e.UNSIGNED_BYTE,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT),r}let ej=`
attribute vec2 a_position;
attribute vec2 a_texCoord;
uniform float u_uvScale;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord * u_uvScale;
}`,eW=`
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_texCoord);
}`,ez={repeat:10497,mirrored:33648,clamp:33071},eH={triangle:function(e,t){let r=a(e,l,u),o=new Float32Array([0,.6,1,0,0,-.6,-.4,0,1,0,.6,-.4,0,0,1]),n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let c=e.getAttribLocation(r,"a_position"),f=e.getAttribLocation(r,"a_color");return{render(){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(r),e.bindBuffer(e.ARRAY_BUFFER,n),e.enableVertexAttribArray(c),e.vertexAttribPointer(c,2,e.FLOAT,!1,20,0),e.enableVertexAttribArray(f),e.vertexAttribPointer(f,3,e.FLOAT,!1,20,8),e.drawArrays(e.TRIANGLES,0,3)},cleanup(){e.deleteBuffer(n),e.deleteProgram(r)}}},rectangle:function(e,t){let r=a(e,c,f),o=new Float32Array([-.5,-.5,.5,-.5,.5,.5,-.5,.5]),n=new Uint16Array([0,1,2,0,2,3]),l=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let u=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,u),e.bufferData(e.ELEMENT_ARRAY_BUFFER,n,e.STATIC_DRAW);let s=e.getAttribLocation(r,"a_position");return{render(){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(r),e.bindBuffer(e.ARRAY_BUFFER,l),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,u),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0)},cleanup(){e.deleteBuffer(l),e.deleteBuffer(u),e.deleteProgram(r)}}},colors:function(e,t){let r=a(e,s,d),o=new Float32Array([0,.6,1,.2,.3,-.6,-.4,.3,1,.2,.6,-.4,.2,.3,1]),l=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let u=e.getAttribLocation(r,"a_position"),c=e.getAttribLocation(r,"a_color");return{render(o,a){i(t),e.viewport(0,0,t.width,t.height);let[f,s,d]=n(a.bgColor??"#000000");e.clearColor(f,s,d,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(r),e.bindBuffer(e.ARRAY_BUFFER,l),e.enableVertexAttribArray(u),e.vertexAttribPointer(u,2,e.FLOAT,!1,20,0),e.enableVertexAttribArray(c),e.vertexAttribPointer(c,3,e.FLOAT,!1,20,8),e.drawArrays(e.TRIANGLES,0,3)},cleanup(){e.deleteBuffer(l),e.deleteProgram(r)}}},circle:function(e,t){let r=a(e,ew,eP),o=e.getAttribLocation(r,"a_position"),n=e.getAttribLocation(r,"a_color"),l=e.createBuffer(),u=-1;return{render(a,c){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(.05,.05,.1,1),e.clear(e.COLOR_BUFFER_BIT);let f=Math.floor(c.segments??32);f!==u&&function(t){let r=new Float32Array(5*(t+2));r[0]=0,r[1]=0,r[2]=1,r[3]=1,r[4]=1;for(let e=0;e<=t;e++){let o=e/t*Math.PI*2,a=(e+1)*5;r[a]=.6*Math.cos(o),r[a+1]=.6*Math.sin(o);let[i,n,l]=function(e){let t=(1-Math.abs(1.2-1))*.8,r=t*(1-Math.abs(6*e%2-1)),o=.6-t/2,[a,i,n]=[[t,r,0],[r,t,0],[0,t,r],[0,r,t],[r,0,t],[t,0,r]][Math.floor(6*e)%6];return[a+o,i+o,n+o]}(e/t);r[a+2]=i,r[a+3]=n,r[a+4]=l}e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,r,e.DYNAMIC_DRAW),u=t}(f),e.useProgram(r),e.bindBuffer(e.ARRAY_BUFFER,l),e.enableVertexAttribArray(o),e.vertexAttribPointer(o,2,e.FLOAT,!1,20,0),e.enableVertexAttribArray(n),e.vertexAttribPointer(n,3,e.FLOAT,!1,20,8),e.drawArrays(e.TRIANGLE_FAN,0,f+2)},cleanup(){e.deleteBuffer(l),e.deleteProgram(r)}}},blending:function(e,t){let r=a(e,eD,eM),o=e.getAttribLocation(r,"a_position"),n=e.getUniformLocation(r,"u_color"),l=eS.map(([t,r])=>{let o=function(e,t,r){let o=new Float32Array(100);o[0]=e,o[1]=t;for(let r=0;r<=48;r++){let a=r/48*Math.PI*2;o[(r+1)*2]=e+.4*Math.cos(a),o[(r+1)*2+1]=t+.4*Math.sin(a)}return o}(t,r,0),a=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW),a});return{render(a,u){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(.05,.05,.1,1),e.clear(e.COLOR_BUFFER_BIT);let c=u.alpha??.5,f=u.blendMode||"normal";e.enable(e.BLEND),"additive"===f?e.blendFunc(e.SRC_ALPHA,e.ONE):"multiply"===f?e.blendFunc(e.DST_COLOR,e.ZERO):e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.useProgram(r);for(let t=0;t<3;t++){let[,,r,a,i]=eS[t];e.uniform4f(n,r,a,i,c),e.bindBuffer(e.ARRAY_BUFFER,l[t]),e.enableVertexAttribArray(o),e.vertexAttribPointer(o,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLE_FAN,0,50)}e.disable(e.BLEND)},cleanup(){for(let t of l)e.deleteBuffer(t);e.deleteProgram(r)}}},translation:function(e,t){let r=a(e,_,m),o=new Float32Array([0,.15,-.15,-.1,.15,-.1]),n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let l=e.getAttribLocation(r,"a_position"),u=e.getUniformLocation(r,"u_translation");return{render(o){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT);let a=.6*Math.sin(.002*o),c=.4*Math.cos(.003*o);e.useProgram(r),e.uniform2f(u,a,c),e.bindBuffer(e.ARRAY_BUFFER,n),e.enableVertexAttribArray(l),e.vertexAttribPointer(l,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLES,0,3)},cleanup(){e.deleteBuffer(n),e.deleteProgram(r)}}},rotation:function(e,t){let r=a(e,v,A),o=new Float32Array([0,.5,1,.4,.1,-.5,-.3,.1,1,.4,.5,-.3,.4,.1,1]),n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let l=e.getAttribLocation(r,"a_position"),u=e.getAttribLocation(r,"a_color"),c=e.getUniformLocation(r,"u_angle");return{render(o,a){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT);let f=a.speed??1,s=a.autoRotate??!0;e.useProgram(r),e.uniform1f(c,s?.001*o*f:f),e.bindBuffer(e.ARRAY_BUFFER,n),e.enableVertexAttribArray(l),e.vertexAttribPointer(l,2,e.FLOAT,!1,20,0),e.enableVertexAttribArray(u),e.vertexAttribPointer(u,3,e.FLOAT,!1,20,8),e.drawArrays(e.TRIANGLES,0,3)},cleanup(){e.deleteBuffer(n),e.deleteProgram(r)}}},scale:function(e,t){let r=a(e,g,E),o=new Float32Array([0,.4,.2,.8,.6,-.4,-.3,.8,.2,.6,.4,-.3,.6,.2,.8]),n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let l=e.getAttribLocation(r,"a_position"),u=e.getAttribLocation(r,"a_color"),c=e.getUniformLocation(r,"u_scale");return{render(o,a){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT);let f=a.scale??1;e.useProgram(r),e.uniform1f(c,f),e.bindBuffer(e.ARRAY_BUFFER,n),e.enableVertexAttribArray(l),e.vertexAttribPointer(l,2,e.FLOAT,!1,20,0),e.enableVertexAttribArray(u),e.vertexAttribPointer(u,3,e.FLOAT,!1,20,8),e.drawArrays(e.TRIANGLES,0,3)},cleanup(){e.deleteBuffer(n),e.deleteProgram(r)}}},combined:function(e,t){let r=a(e,eC,eN),o=new Float32Array([0,.4,.9,.3,.3,-.35,-.3,.3,.9,.3,.35,-.3,.3,.3,.9]),n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let l=e.getAttribLocation(r,"a_position"),u=e.getAttribLocation(r,"a_color"),c=e.getUniformLocation(r,"u_matrix");return{render(o,a){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(.05,.05,.1,1),e.clear(e.COLOR_BUFFER_BIT);let f=function(e,t,r,o,a){let i,n,l=new Float32Array([1,0,0,0,1,0,t,r,1]),u=new Float32Array([i=Math.cos(o),n=Math.sin(o),0,-n,i,0,0,0,1]),c=new Float32Array([a,0,0,0,a,0,0,0,1]),f={TRS:[l,u,c],TSR:[l,c,u],RTS:[u,l,c],SRT:[c,u,l]},s=f[e]||f.TRS,d=new Float32Array([1,0,0,0,1,0,0,0,1]);for(let e of s)d=function(e,t){let r=new Float32Array(9);for(let o=0;o<3;o++)for(let a=0;a<3;a++)r[3*a+o]=e[o]*t[3*a]+e[3+o]*t[3*a+1]+e[6+o]*t[3*a+2];return r}(e,d);return d}(a.order||"TRS",a.tx??0,a.ty??0,(a.angle??0)*Math.PI/180,a.scale??1);e.useProgram(r),e.uniformMatrix3fv(c,!1,f),e.bindBuffer(e.ARRAY_BUFFER,n),e.enableVertexAttribArray(l),e.vertexAttribPointer(l,2,e.FLOAT,!1,20,0),e.enableVertexAttribArray(u),e.vertexAttribPointer(u,3,e.FLOAT,!1,20,8),e.drawArrays(e.TRIANGLES,0,3)},cleanup(){e.deleteBuffer(n),e.deleteProgram(r)}}},ambient:function(e,t){let r=a(e,F,y),{vertices:o,indices:n}=function(){let e=[];for(let t=0;t<6;t++){let r=4*t;e.push(r,r+1,r+2,r,r+2,r+3)}return{vertices:new Float32Array([-.5,-.5,.5,.9,.3,.3,.5,-.5,.5,.9,.3,.3,.5,.5,.5,.9,.3,.3,-.5,.5,.5,.9,.3,.3,-.5,-.5,-.5,.3,.9,.3,.5,-.5,-.5,.3,.9,.3,.5,.5,-.5,.3,.9,.3,-.5,.5,-.5,.3,.9,.3,-.5,.5,-.5,.3,.3,.9,.5,.5,-.5,.3,.3,.9,.5,.5,.5,.3,.3,.9,-.5,.5,.5,.3,.3,.9,-.5,-.5,-.5,.9,.9,.3,.5,-.5,-.5,.9,.9,.3,.5,-.5,.5,.9,.9,.3,-.5,-.5,.5,.9,.9,.3,.5,-.5,-.5,.3,.9,.9,.5,.5,-.5,.3,.9,.9,.5,.5,.5,.3,.9,.9,.5,-.5,.5,.3,.9,.9,-.5,-.5,-.5,.9,.3,.9,-.5,.5,-.5,.9,.3,.9,-.5,.5,.5,.9,.3,.9,-.5,-.5,.5,.9,.3,.9]),indices:new Uint16Array(e)}}(),l=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let u=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,u),e.bufferData(e.ELEMENT_ARRAY_BUFFER,n,e.STATIC_DRAW);let c=e.getAttribLocation(r,"a_position"),f=e.getAttribLocation(r,"a_color"),s=e.getUniformLocation(r,"u_mvp"),d=e.getUniformLocation(r,"u_ambientColor"),_=e.getUniformLocation(r,"u_ambientIntensity");return{render(o){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(.05,.05,.1,1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.enable(e.DEPTH_TEST);let a=b(Math.PI/4,t.width/t.height,.1,100),n=R(),m=h(a,n=p(n=x(n=T(n,0,0,-3),8e-4*o),.001*o));e.useProgram(r),e.uniformMatrix4fv(s,!1,m),e.uniform3f(d,1,.95,.9),e.uniform1f(_,.7),e.bindBuffer(e.ARRAY_BUFFER,l),e.enableVertexAttribArray(c),e.vertexAttribPointer(c,3,e.FLOAT,!1,24,0),e.enableVertexAttribArray(f),e.vertexAttribPointer(f,3,e.FLOAT,!1,24,12),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,u),e.drawElements(e.TRIANGLES,36,e.UNSIGNED_SHORT,0)},cleanup(){e.deleteBuffer(l),e.deleteBuffer(u),e.deleteProgram(r)}}},diffuse:function(e,t){let r,o,n=a(e,U,B),{vertices:l,indices:u}=(r=[],o=[],[{normal:[0,0,1],color:[.9,.4,.4],verts:[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]},{normal:[0,0,-1],color:[.4,.9,.4],verts:[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]},{normal:[0,1,0],color:[.4,.4,.9],verts:[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]},{normal:[0,-1,0],color:[.9,.9,.4],verts:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]},{normal:[1,0,0],color:[.4,.9,.9],verts:[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]},{normal:[-1,0,0],color:[.9,.4,.9],verts:[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]}].forEach((e,t)=>{for(let t of e.verts)r.push(...t,...e.normal,...e.color);let a=4*t;o.push(a,a+1,a+2,a,a+2,a+3)}),{vertices:new Float32Array(r),indices:new Uint16Array(o)}),c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c),e.bufferData(e.ARRAY_BUFFER,l,e.STATIC_DRAW);let f=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,f),e.bufferData(e.ELEMENT_ARRAY_BUFFER,u,e.STATIC_DRAW);let s=e.getAttribLocation(n,"a_position"),d=e.getAttribLocation(n,"a_normal"),_=e.getAttribLocation(n,"a_color"),m=e.getUniformLocation(n,"u_mvp"),v=e.getUniformLocation(n,"u_model"),A=e.getUniformLocation(n,"u_lightDir"),g=e.getUniformLocation(n,"u_lightColor");return{render(r){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(.05,.05,.1,1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.enable(e.DEPTH_TEST);let o=b(Math.PI/4,t.width/t.height,.1,100),a=R(),l=h(o,a=p(a=x(a=T(a,0,0,-3),7e-4*r),.001*r));e.useProgram(n),e.uniformMatrix4fv(m,!1,l),e.uniformMatrix4fv(v,!1,a),e.uniform3f(A,.5,.7,1),e.uniform3f(g,1,1,.95),e.bindBuffer(e.ARRAY_BUFFER,c),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,3,e.FLOAT,!1,36,0),e.enableVertexAttribArray(d),e.vertexAttribPointer(d,3,e.FLOAT,!1,36,12),e.enableVertexAttribArray(_),e.vertexAttribPointer(_,3,e.FLOAT,!1,36,24),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,f),e.drawElements(e.TRIANGLES,36,e.UNSIGNED_SHORT,0)},cleanup(){e.deleteBuffer(c),e.deleteBuffer(f),e.deleteProgram(n)}}},specular:function(e,t){let r,o,n=a(e,eI,eO),{vertices:l,indices:u}=(r=[],o=[],[{n:[0,0,1],c:[.9,.4,.4],v:[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]},{n:[0,0,-1],c:[.4,.9,.4],v:[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]},{n:[0,1,0],c:[.4,.4,.9],v:[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]},{n:[0,-1,0],c:[.9,.9,.4],v:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]},{n:[1,0,0],c:[.4,.9,.9],v:[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]},{n:[-1,0,0],c:[.9,.4,.9],v:[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]}].forEach((e,t)=>{for(let t of e.v)r.push(...t,...e.n,...e.c);let a=4*t;o.push(a,a+1,a+2,a,a+2,a+3)}),{vertices:new Float32Array(r),indices:new Uint16Array(o)}),c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c),e.bufferData(e.ARRAY_BUFFER,l,e.STATIC_DRAW);let f=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,f),e.bufferData(e.ELEMENT_ARRAY_BUFFER,u,e.STATIC_DRAW);let s=e.getAttribLocation(n,"a_position"),d=e.getAttribLocation(n,"a_normal"),_=e.getAttribLocation(n,"a_color"),m=e.getUniformLocation(n,"u_mvp"),v=e.getUniformLocation(n,"u_model"),A=e.getUniformLocation(n,"u_lightDir"),g=e.getUniformLocation(n,"u_viewPos"),E=e.getUniformLocation(n,"u_shininess"),F=e.getUniformLocation(n,"u_specularIntensity");return{render(r,o){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(.05,.05,.1,1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.enable(e.DEPTH_TEST);let a=o.shininess??32,l=o.specularIntensity??.5,u=b(Math.PI/4,t.width/t.height,.1,100),y=R(),U=h(u,y=p(y=x(y=T(y,0,0,-3),7e-4*r),.001*r));e.useProgram(n),e.uniformMatrix4fv(m,!1,U),e.uniformMatrix4fv(v,!1,y),e.uniform3f(A,.5,.7,1),e.uniform3f(g,0,0,0),e.uniform1f(E,a),e.uniform1f(F,l),e.bindBuffer(e.ARRAY_BUFFER,c),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,3,e.FLOAT,!1,36,0),e.enableVertexAttribArray(d),e.vertexAttribPointer(d,3,e.FLOAT,!1,36,12),e.enableVertexAttribArray(_),e.vertexAttribPointer(_,3,e.FLOAT,!1,36,24),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,f),e.drawElements(e.TRIANGLES,36,e.UNSIGNED_SHORT,0)},cleanup(){e.deleteBuffer(c),e.deleteBuffer(f),e.deleteProgram(n)}}},"point-light":function(e,t){let r,o,l=a(e,eY,eX),{vertices:u,indices:c}=(r=[],o=[],[{n:[0,0,1],c:[.9,.4,.4],v:[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]},{n:[0,0,-1],c:[.4,.9,.4],v:[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]},{n:[0,1,0],c:[.4,.4,.9],v:[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]},{n:[0,-1,0],c:[.9,.9,.4],v:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]},{n:[1,0,0],c:[.4,.9,.9],v:[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]},{n:[-1,0,0],c:[.9,.4,.9],v:[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]}].forEach((e,t)=>{for(let t of e.v)r.push(...t,...e.n,...e.c);let a=4*t;o.push(a,a+1,a+2,a,a+2,a+3)}),{vertices:new Float32Array(r),indices:new Uint16Array(o)}),f=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,f),e.bufferData(e.ARRAY_BUFFER,u,e.STATIC_DRAW);let s=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,s),e.bufferData(e.ELEMENT_ARRAY_BUFFER,c,e.STATIC_DRAW);let d=e.getAttribLocation(l,"a_position"),_=e.getAttribLocation(l,"a_normal"),m=e.getAttribLocation(l,"a_color"),v=e.getUniformLocation(l,"u_mvp"),A=e.getUniformLocation(l,"u_model"),g=e.getUniformLocation(l,"u_lightPos"),E=e.getUniformLocation(l,"u_lightColor"),F=e.getUniformLocation(l,"u_attenuation"),y=1.5,U=1,B=!1,L=e=>{B=!0,D(e)},w=e=>{B&&D(e)},P=()=>{B=!1};function D(e){let r=t.getBoundingClientRect();y=((e.clientX-r.left)/r.width-.5)*6,U=(.5-(e.clientY-r.top)/r.height)*6}return t.addEventListener("mousedown",L),window.addEventListener("mousemove",w),window.addEventListener("mouseup",P),{render(r,o){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(.02,.02,.05,1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.enable(e.DEPTH_TEST);let[a,u,c]=n(o.lightColor||"#FFFFFF"),B=o.attenuation??1,L=b(Math.PI/4,t.width/t.height,.1,100),w=R(),P=h(L,w=p(w=x(w=T(w,0,0,-3),5e-4*r),8e-4*r));e.useProgram(l),e.uniformMatrix4fv(v,!1,P),e.uniformMatrix4fv(A,!1,w),e.uniform3f(g,y,U,2),e.uniform3f(E,a,u,c),e.uniform1f(F,B),e.bindBuffer(e.ARRAY_BUFFER,f),e.enableVertexAttribArray(d),e.vertexAttribPointer(d,3,e.FLOAT,!1,36,0),e.enableVertexAttribArray(_),e.vertexAttribPointer(_,3,e.FLOAT,!1,36,12),e.enableVertexAttribArray(m),e.vertexAttribPointer(m,3,e.FLOAT,!1,36,24),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,s),e.drawElements(e.TRIANGLES,36,e.UNSIGNED_SHORT,0)},cleanup(){t.removeEventListener("mousedown",L),window.removeEventListener("mousemove",w),window.removeEventListener("mouseup",P),e.deleteBuffer(f),e.deleteBuffer(s),e.deleteProgram(l)}}},"basic-texture":function(e,t){let r=a(e,L,w),o=new Float32Array([-.6,-.6,0,0,.6,-.6,1,0,.6,.6,1,1,-.6,.6,0,1]),n=new Uint16Array([0,1,2,0,2,3]),l=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let u=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,u),e.bufferData(e.ELEMENT_ARRAY_BUFFER,n,e.STATIC_DRAW);let c=e.createTexture();e.bindTexture(e.TEXTURE_2D,c);let f=function(e){let t=new Uint8Array(256);for(let e=0;e<8;e++)for(let r=0;r<8;r++){let o=(8*e+r)*4,a=(r+e)%2==0?240:40;t[o]=a,t[o+1]=a,t[o+2]=a,t[o+3]=255}return t}(0);e.texImage2D(e.TEXTURE_2D,0,e.RGBA,8,8,0,e.RGBA,e.UNSIGNED_BYTE,f),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT);let s=e.getAttribLocation(r,"a_position"),d=e.getAttribLocation(r,"a_texCoord");return{render(){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(.1,.1,.1,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(r),e.bindBuffer(e.ARRAY_BUFFER,l),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,16,0),e.enableVertexAttribArray(d),e.vertexAttribPointer(d,2,e.FLOAT,!1,16,8),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,u),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0)},cleanup(){e.deleteBuffer(l),e.deleteBuffer(u),e.deleteTexture(c),e.deleteProgram(r)}}},"multi-texture":function(e,t){let r=a(e,ek,eG),o=new Float32Array([-.6,-.6,0,0,.6,-.6,1,0,.6,.6,1,1,-.6,.6,0,1]),n=new Uint16Array([0,1,2,0,2,3]),l=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let u=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,u),e.bufferData(e.ELEMENT_ARRAY_BUFFER,n,e.STATIC_DRAW);let c=eV(e,function(){let e=new Uint8Array(256);for(let t=0;t<8;t++)for(let r=0;r<8;r++){let o=(8*t+r)*4,a=(r+t)%2==0?230:50;e[o]=a,e[o+1]=a,e[o+2]=a,e[o+3]=255}return e}()),f=eV(e,function(){let e=new Uint8Array(256);for(let t=0;t<8;t++)for(let r=0;r<8;r++){let o=(8*t+r)*4,a=r%2==0;e[o]=a?60:200,e[o+1]=a?120:220,e[o+2]=a?200:100,e[o+3]=255}return e}()),s=e.getAttribLocation(r,"a_position"),d=e.getAttribLocation(r,"a_texCoord"),_=e.getUniformLocation(r,"u_textureA"),m=e.getUniformLocation(r,"u_textureB"),v=e.getUniformLocation(r,"u_mixRatio");return{render(o,a){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(.1,.1,.1,1),e.clear(e.COLOR_BUFFER_BIT);let n=a.mixRatio??.5;e.useProgram(r),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.uniform1i(_,0),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,f),e.uniform1i(m,1),e.uniform1f(v,n),e.bindBuffer(e.ARRAY_BUFFER,l),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,16,0),e.enableVertexAttribArray(d),e.vertexAttribPointer(d,2,e.FLOAT,!1,16,8),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,u),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0)},cleanup(){e.deleteBuffer(l),e.deleteBuffer(u),e.deleteTexture(c),e.deleteTexture(f),e.deleteProgram(r)}}},"texture-wrapping":function(e,t){let r=a(e,ej,eW),o=new Float32Array([-.7,-.7,0,0,.7,-.7,1,0,.7,.7,1,1,-.7,.7,0,1]),n=new Uint16Array([0,1,2,0,2,3]),l=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let u=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,u),e.bufferData(e.ELEMENT_ARRAY_BUFFER,n,e.STATIC_DRAW);let c=e.createTexture();e.bindTexture(e.TEXTURE_2D,c),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,16,16,0,e.RGBA,e.UNSIGNED_BYTE,function(){let e=new Uint8Array(1024);for(let t=0;t<16;t++)for(let r=0;r<16;r++){let o=(16*t+r)*4,a=r/15,i=t/15;e[o]=Math.round(220*a+30),e[o+1]=Math.round(180*i+40),e[o+2]=Math.round((1-a)*150+50),e[o+3]=255}return e}()),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR);let f=e.getAttribLocation(r,"a_position"),s=e.getAttribLocation(r,"a_texCoord"),d=e.getUniformLocation(r,"u_texture"),_=e.getUniformLocation(r,"u_uvScale"),m="";return{render(o,a){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(.1,.1,.1,1),e.clear(e.COLOR_BUFFER_BIT);let n=a.wrapMode||"repeat",v=a.uvScale??2;if(n!==m){let t=ez[n]??e.REPEAT;e.bindTexture(e.TEXTURE_2D,c),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,t),m=n}e.useProgram(r),e.uniform1f(_,v),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.uniform1i(d,0),e.bindBuffer(e.ARRAY_BUFFER,l),e.enableVertexAttribArray(f),e.vertexAttribPointer(f,2,e.FLOAT,!1,16,0),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,16,8),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,u),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0)},cleanup(){e.deleteBuffer(l),e.deleteBuffer(u),e.deleteTexture(c),e.deleteProgram(r)}}},shader:function(e,t){let r={};for(let[t,o]of Object.entries(C))r[t]=a(e,P,o);let o=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,N,e.STATIC_DRAW);let n=e.createBuffer();return e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,n),e.bufferData(e.ELEMENT_ARRAY_BUFFER,I,e.STATIC_DRAW),{render(a,l){i(t),e.viewport(0,0,t.width,t.height);let u=r[l.shaderType??"default"]??r.default;e.useProgram(u);let c=e.getAttribLocation(u,"a_position"),f=e.getUniformLocation(u,"u_time"),s=e.getUniformLocation(u,"u_resolution");e.uniform1f(f,.001*a),e.uniform2f(s,t.width,t.height),e.bindBuffer(e.ARRAY_BUFFER,o),e.enableVertexAttribArray(c),e.vertexAttribPointer(c,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,n),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0)},cleanup(){for(let t of(e.deleteBuffer(o),e.deleteBuffer(n),Object.values(r)))e.deleteProgram(t)}}},particles:function(e,t){let r=a(e,O,Y),o=[];for(let e=0;e<300;e++){let e=X(),t=Math.random();e.x+=e.vx*e.maxLife*t,e.y+=e.vy*e.maxLife*t,e.life=1-t,o.push(e)}let n=new Float32Array(900),l=e.createBuffer(),u=e.getAttribLocation(r,"a_position"),c=e.getAttribLocation(r,"a_life");return{render(){i(t),e.viewport(0,0,t.width,t.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE);for(let e=0;e<300;e++){let t=o[e];if(t.x+=t.vx,t.y+=t.vy,t.life-=1/t.maxLife,t.life<=0){let t=X();o[e]=t,n[3*e]=t.x,n[3*e+1]=t.y,n[3*e+2]=t.life}else n[3*e]=t.x,n[3*e+1]=t.y,n[3*e+2]=t.life}e.useProgram(r),e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,n,e.DYNAMIC_DRAW),e.enableVertexAttribArray(u),e.vertexAttribPointer(u,2,e.FLOAT,!1,12,0),e.enableVertexAttribArray(c),e.vertexAttribPointer(c,1,e.FLOAT,!1,12,8),e.drawArrays(e.POINTS,0,300),e.disable(e.BLEND)},cleanup(){e.deleteBuffer(l),e.deleteProgram(r)}}},"solar-system":function(e,t){let r=a(e,k,G),o=e.getUniformLocation(r,"u_model"),n=e.getUniformLocation(r,"u_view"),l=e.getUniformLocation(r,"u_projection"),u=e.getUniformLocation(r,"u_color"),c=e.getUniformLocation(r,"u_lightPosition"),f=e.getUniformLocation(r,"u_emissive"),s=e.getAttribLocation(r,"a_position"),d=e.getAttribLocation(r,"a_normal"),_=a(e,V,j),m=e.getUniformLocation(_,"u_view"),v=e.getUniformLocation(_,"u_projection"),A=e.getAttribLocation(_,"a_position"),g=function(e,t){let r=[],o=[];for(let e=0;e<=24;e++){let t=e*Math.PI/24,o=Math.sin(t),a=Math.cos(t);for(let e=0;e<=32;e++){let t=2*e*Math.PI/32,i=o*Math.cos(t),n=o*Math.sin(t);r.push(i,a,n,i,a,n)}}for(let e=0;e<24;e++)for(let t=0;t<32;t++){let r=33*e+t,a=r+32+1;o.push(r,a,r+1),o.push(a,a+1,r+1)}return{vertices:new Float32Array(r),indices:new Uint16Array(o),indexCount:o.length}}(0,0),E=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,E),e.bufferData(e.ARRAY_BUFFER,g.vertices,e.STATIC_DRAW);let x=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,x),e.bufferData(e.ELEMENT_ARRAY_BUFFER,g.indices,e.STATIC_DRAW);let h=z.map(t=>{let r=function(e,t){let r=[];for(let t=0;t<=128;t++){let o=2*t*Math.PI/128;r.push(Math.cos(o)*e,0,Math.sin(o)*e)}return new Float32Array(r)}(t.orbitRadius,0),o=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,r,e.STATIC_DRAW),o}),F=.4,y=.6,U=20,B=!1,L=0,w=0,P=e=>{B=!0,L=e.clientX,w=e.clientY},D=e=>{if(!B)return;let t=e.clientX-L,r=e.clientY-w;F-=.005*t,y+=.005*r,y=Math.max(-Math.PI/2+.05,Math.min(Math.PI/2-.05,y)),L=e.clientX,w=e.clientY},M=()=>{B=!1},S=e=>{e.preventDefault(),U+=.02*e.deltaY,U=Math.max(5,Math.min(50,U))};function C(t,a,i,_,m){var v,A,b,h;let F,y=R();t.orbitRadius>0&&(y=T(y=p(y,3e-4*a*t.orbitSpeed*i),t.orbitRadius,0,0)),v=y=p(y,.001*a*t.rotationSpeed*i),A=t.size,b=t.size,h=t.size,(F=new Float32Array(v))[0]=v[0]*A,F[1]=v[1]*A,F[2]=v[2]*A,F[3]=v[3]*A,F[4]=v[4]*b,F[5]=v[5]*b,F[6]=v[6]*b,F[7]=v[7]*b,F[8]=v[8]*h,F[9]=v[9]*h,F[10]=v[10]*h,F[11]=v[11]*h,y=F,e.useProgram(r),e.uniformMatrix4fv(o,!1,y),e.uniformMatrix4fv(n,!1,_),e.uniformMatrix4fv(l,!1,m),e.uniform3f(u,t.color[0],t.color[1],t.color[2]),e.uniform3f(c,0,0,0),e.uniform1i(f,+!!t.emissive),e.bindBuffer(e.ARRAY_BUFFER,E),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,3,e.FLOAT,!1,24,0),e.enableVertexAttribArray(d),e.vertexAttribPointer(d,3,e.FLOAT,!1,24,12),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,x),e.drawElements(e.TRIANGLES,g.indexCount,e.UNSIGNED_SHORT,0)}return t.addEventListener("mousedown",P),window.addEventListener("mousemove",D),window.addEventListener("mouseup",M),t.addEventListener("wheel",S,{passive:!1}),{render(r,o){let a,n,l,u,c,f,s,d,g,E,R,T=o.speed??1,x=o.showOrbits??!0,p=o.autoRotate??!1;i(t),e.viewport(0,0,t.width,t.height),e.clearColor(.02,.02,.05,1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.enable(e.DEPTH_TEST),p&&!B&&(F+=.002);let L=U*Math.cos(y)*Math.sin(F),w=U*Math.sin(y),P=U*Math.cos(y)*Math.cos(F),D=b(Math.PI/4,t.width/t.height,.1,200),M=(S=[L,w,P],N=[0,0,0],I=[0,1,0],a=new Float32Array(16),n=N[0]-S[0],c=Math.sqrt(n*n+(l=N[1]-S[1])*l+(u=N[2]-S[2])*u),n/=c,l/=c,u/=c,f=l*I[2]-u*I[1],c=Math.sqrt(f*f+(s=u*I[0]-n*I[2])*s+(d=n*I[1]-l*I[0])*d),f/=c,g=(s/=c)*u-(d/=c)*l,E=d*n-f*u,R=f*l-s*n,a[0]=f,a[1]=g,a[2]=-n,a[3]=0,a[4]=s,a[5]=E,a[6]=-l,a[7]=0,a[8]=d,a[9]=R,a[10]=-u,a[11]=0,a[12]=-(f*S[0]+s*S[1]+d*S[2]),a[13]=-(g*S[0]+E*S[1]+R*S[2]),a[14]=n*S[0]+l*S[1]+u*S[2],a[15]=1,a);if(x){var S,N,I;e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.useProgram(_),e.uniformMatrix4fv(m,!1,M),e.uniformMatrix4fv(v,!1,D);for(let t=0;t<h.length;t++)e.bindBuffer(e.ARRAY_BUFFER,h[t]),e.enableVertexAttribArray(A),e.vertexAttribPointer(A,3,e.FLOAT,!1,0,0),e.drawArrays(e.LINE_LOOP,0,129);e.disable(e.BLEND)}for(let e of(C(W,r,T,M,D),z))C(e,r,T,M,D)},cleanup(){for(let r of(t.removeEventListener("mousedown",P),window.removeEventListener("mousemove",D),window.removeEventListener("mouseup",M),t.removeEventListener("wheel",S),e.deleteBuffer(E),e.deleteBuffer(x),h))e.deleteBuffer(r);e.deleteProgram(r),e.deleteProgram(_)}}},marbling:function(e,t){let r=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,r),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),e.STATIC_DRAW);let o=a(e,H,q),l=a(e,H,$),u=a(e,H,K),c=a(e,H,J),f={texture:e.getUniformLocation(o,"u_texture"),center:e.getUniformLocation(o,"u_center"),radius:e.getUniformLocation(o,"u_radius"),inkColor:e.getUniformLocation(o,"u_inkColor"),aspect:e.getUniformLocation(o,"u_aspect")},s={texture:e.getUniformLocation(l,"u_texture"),start:e.getUniformLocation(l,"u_start"),end:e.getUniformLocation(l,"u_end"),strength:e.getUniformLocation(l,"u_strength"),width:e.getUniformLocation(l,"u_width"),aspect:e.getUniformLocation(l,"u_aspect")},d={texture:e.getUniformLocation(u,"u_texture"),center:e.getUniformLocation(u,"u_center"),radius:e.getUniformLocation(u,"u_radius"),angle:e.getUniformLocation(u,"u_angle"),aspect:e.getUniformLocation(u,"u_aspect")},_={texture:e.getUniformLocation(c,"u_texture")},m=[],v=[],A=0,g=0,E=0;function R(t){let o=e.getAttribLocation(t,"a_position");e.bindBuffer(e.ARRAY_BUFFER,r),e.enableVertexAttribArray(o),e.vertexAttribPointer(o,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLES,0,6)}let b=[],T=!1,x=null,p=null,h={};function F(e){let r=t.getBoundingClientRect();return[(e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height]}let y=e=>{e.preventDefault(),T=!0;let t=F(e);x=t;let r=h.tool||"drop";if("drop"===r){let e=n(h.inkColor||"#E63946"),r=h.radius||.08;b.push({type:"drop",center:t,radius:r,color:e})}else"swirl"===r&&(p=t)},U=e=>{if(!T||!x)return;let t=F(e);if("tine"===(h.tool||"drop")){let e=h.strength||3,r=h.radius||.08;b.push({type:"tine",start:x,end:t,strength:e,width:r}),x=t}},B=()=>{T=!1,x=null,p=null};return t.addEventListener("mousedown",y),window.addEventListener("mousemove",U),window.addEventListener("mouseup",B),{render(r,a){h=a,i(t);let n=t.width,x=t.height;if((n!==A||x!==g)&&function(t,r){for(let t of m)e.deleteTexture(t);for(let t of v)e.deleteFramebuffer(t);m.length=0,v.length=0;for(let o=0;o<2;o++){let o=e.createTexture();e.bindTexture(e.TEXTURE_2D,o),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,r,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let a=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,a),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o,0),m.push(o),v.push(a)}for(let o=0;o<2;o++)e.bindFramebuffer(e.FRAMEBUFFER,v[o]),e.viewport(0,0,t,r),e.clearColor(1,1,1,1),e.clear(e.COLOR_BUFFER_BIT);e.bindFramebuffer(e.FRAMEBUFFER,null),A=t,g=r,E=0}(n,x),T&&p){let e=a.radius||.08,t=a.strength||3;b.push({type:"swirl",center:p,radius:3*e,angle:.02*t})}for(let t of b)!function(t){let r=m[E],a=v[1-E],i=A/g;e.bindFramebuffer(e.FRAMEBUFFER,a),e.viewport(0,0,A,g),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,r),"drop"===t.type?(e.useProgram(o),e.uniform1i(f.texture,0),e.uniform2f(f.center,t.center[0],t.center[1]),e.uniform1f(f.radius,t.radius),e.uniform3f(f.inkColor,t.color[0],t.color[1],t.color[2]),e.uniform1f(f.aspect,i),R(o)):"tine"===t.type?(e.useProgram(l),e.uniform1i(s.texture,0),e.uniform2f(s.start,t.start[0],t.start[1]),e.uniform2f(s.end,t.end[0],t.end[1]),e.uniform1f(s.strength,t.strength),e.uniform1f(s.width,t.width),e.uniform1f(s.aspect,i),R(l)):(e.useProgram(u),e.uniform1i(d.texture,0),e.uniform2f(d.center,t.center[0],t.center[1]),e.uniform1f(d.radius,t.radius),e.uniform1f(d.angle,t.angle),e.uniform1f(d.aspect,i),R(u)),E=1-E}(t);b.length=0,e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,n,x),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,m[E]),e.useProgram(c),e.uniform1i(_.texture,0),R(c)},cleanup(){for(let r of(t.removeEventListener("mousedown",y),window.removeEventListener("mousemove",U),window.removeEventListener("mouseup",B),m))e.deleteTexture(r);for(let t of v)e.deleteFramebuffer(t);e.deleteBuffer(r),e.deleteProgram(o),e.deleteProgram(l),e.deleteProgram(u),e.deleteProgram(c)}}},"falling-sand":function(e,t){let r,o,l=a(e,Z,Q),u=e.getUniformLocation(l,"u_texture"),c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),e.STATIC_DRAW);let f=e.getAttribLocation(l,"a_position"),s=0,d=0,_=null,m=0;function v(e,t){r[e]=0,r[t]=1;let a=4*e,i=4*t;o[i]=o[a],o[i+1]=o[a+1],o[i+2]=o[a+2],o[i+3]=o[a+3],o[a]=13,o[a+1]=13,o[a+2]=26,o[a+3]=255}let A=!1,g={};function E(e,a){let i,l,u,c,f,_;if(!s)return;let[m,v]=(c=t.getBoundingClientRect(),f=Math.floor((e.clientX-c.left)/c.width*s),_=Math.floor((e.clientY-c.top)/c.height*d),[Math.max(0,Math.min(s-1,f)),Math.max(0,Math.min(d-1,_))]),A=g.brushSize||3;if(g.rainbow)[i,l,u]=function(e,t,r){let o=(1-Math.abs(1.1-1))*.75,a=o*(1-Math.abs(6*e%2-1)),i=.55-o/2,n=0,l=0,u=0;switch(Math.floor(6*e)%6){case 0:n=o,l=a;break;case 1:n=a,l=o;break;case 2:l=o,u=a;break;case 3:l=a,u=o;break;case 4:n=a,u=o;break;case 5:n=o,u=a}return[Math.round((n+i)*255),Math.round((l+i)*255),Math.round((u+i)*255)]}(5e-5*a%1,0,0);else{let[e,t,r]=n(g.sandColor||"#E8A530");i=Math.round(255*e),l=Math.round(255*t),u=Math.round(255*r)}!function(e,t,a,i,n,l){for(let u=-a;u<=a;u++)for(let c=-a;c<=a;c++){if(c*c+u*u>a*a)continue;let f=e+c,_=t+u;if(f<0||f>=s||_<0||_>=d)continue;let m=_*s+f;if(r[m]||Math.random()>.6)continue;r[m]=1;let v=Math.floor(30*Math.random())-15,A=4*m;o[A]=Math.max(0,Math.min(255,i+v)),o[A+1]=Math.max(0,Math.min(255,n+v)),o[A+2]=Math.max(0,Math.min(255,l+v)),o[A+3]=255}}(m,v,A,i,l,u)}let R=0,b=e=>{e.preventDefault(),A=!0,E(e,R)},T=e=>{A&&E(e,R)},x=()=>{A=!1};return t.addEventListener("mousedown",b),window.addEventListener("mousemove",T),window.addEventListener("mouseup",x),{render(a,n){g=n,R=a,i(t);let A=t.width,E=t.height;0===s&&function(t,a){r=new Uint8Array((s=Math.min(Math.floor(t/4),300))*(d=Math.min(Math.floor(a/4),200))),o=new Uint8Array(s*d*4);for(let e=0;e<s*d;e++){let t=4*e;o[t]=13,o[t+1]=13,o[t+2]=26,o[t+3]=255}_&&e.deleteTexture(_),_=e.createTexture(),e.bindTexture(e.TEXTURE_2D,_),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,s,d,0,e.RGBA,e.UNSIGNED_BYTE,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}(A,E);let b=n.speed||2;for(let e=0;e<b;e++)!function(){let e=m%2==0,t=e?0:s-1,o=e?s:-1,a=e?1:-1;for(let e=d-2;e>=0;e--)for(let i=t;i!==o;i+=a){let t=e*s+i;if(!r[t])continue;let o=(e+1)*s+i;if(!r[o]){v(t,o);continue}let a=.5>Math.random(),n=a?-1:1,l=a?1:-1,u=i+n;if(u>=0&&u<s){let o=(e+1)*s+u;if(!r[o]){v(t,o);continue}}let c=i+l;if(c>=0&&c<s){let o=(e+1)*s+c;r[o]||v(t,o)}}m++}();e.bindTexture(e.TEXTURE_2D,_),e.texSubImage2D(e.TEXTURE_2D,0,0,0,s,d,e.RGBA,e.UNSIGNED_BYTE,o),e.viewport(0,0,A,E),e.clearColor(13/255,13/255,26/255,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(l),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,_),e.uniform1i(u,0),e.bindBuffer(e.ARRAY_BUFFER,c),e.enableVertexAttribArray(f),e.vertexAttribPointer(f,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLES,0,6)},cleanup(){t.removeEventListener("mousedown",b),window.removeEventListener("mousemove",T),window.removeEventListener("mouseup",x),_&&e.deleteTexture(_),e.deleteBuffer(c),e.deleteProgram(l)}}},mandelbulb:function(e,t){let r=a(e,ee,et),o=e.getUniformLocation(r,"u_resolution"),n=e.getUniformLocation(r,"u_cameraPos"),l=e.getUniformLocation(r,"u_power"),u=e.getUniformLocation(r,"u_iterations"),c=e.getUniformLocation(r,"u_colorScheme"),f=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,f),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),e.STATIC_DRAW);let s=e.getAttribLocation(r,"a_position"),d=.5,_=.3,m=2.5,v=!1,A=0,g=0,E=e=>{v=!0,A=e.clientX,g=e.clientY},R=e=>{if(!v)return;let t=e.clientX-A,r=e.clientY-g;d-=.005*t,_+=.005*r,_=Math.max(-Math.PI/2+.05,Math.min(Math.PI/2-.05,_)),A=e.clientX,g=e.clientY},b=()=>{v=!1},T=e=>{e.preventDefault(),m+=.003*e.deltaY,m=Math.max(1.5,Math.min(6,m))};return t.addEventListener("mousedown",E),window.addEventListener("mousemove",R),window.addEventListener("mouseup",b),t.addEventListener("wheel",T,{passive:!1}),{render(a,A){i(t);let g=t.width,E=t.height,R=A.power??8,b=A.iterations??8,T=er[A.colorScheme||"classic"]??0;(A.autoRotate??!0)&&!v&&(d+=.003);let x=m*Math.cos(_)*Math.sin(d),p=m*Math.sin(_),h=m*Math.cos(_)*Math.cos(d);e.viewport(0,0,g,E),e.clearColor(.02,.02,.05,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(r),e.uniform2f(o,g,E),e.uniform3f(n,x,p,h),e.uniform1f(l,R),e.uniform1i(u,b),e.uniform1i(c,T),e.bindBuffer(e.ARRAY_BUFFER,f),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLES,0,6)},cleanup(){t.removeEventListener("mousedown",E),window.removeEventListener("mousemove",R),window.removeEventListener("mouseup",b),t.removeEventListener("wheel",T),e.deleteBuffer(f),e.deleteProgram(r)}}},"game-of-life":function(e,t){let r=a(e,eo,ea),o=a(e,eo,ei),n=e.getUniformLocation(r,"u_state"),l=e.getUniformLocation(r,"u_resolution"),u=e.getUniformLocation(o,"u_state"),c=e.getUniformLocation(o,"u_resolution"),f=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,f),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),e.STATIC_DRAW);let s=[],d=[],_=0;function m(t){let r=e.getAttribLocation(t,"a_position");e.bindBuffer(e.ARRAY_BUFFER,f),e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLES,0,6)}let v=!1;function A(r){let o=t.getBoundingClientRect(),a=Math.floor((r.clientX-o.left)/o.width*256),i=255-Math.floor((r.clientY-o.top)/o.height*256);if(a<0||a>=256||i<0||i>=256)return;let n=new Uint8Array([255,255,255,255]);e.bindTexture(e.TEXTURE_2D,s[_]),e.texSubImage2D(e.TEXTURE_2D,0,a,i,1,1,e.RGBA,e.UNSIGNED_BYTE,n)}let g=e=>{e.preventDefault(),v=!0,A(e)},E=e=>{v&&A(e)},R=()=>{v=!1};t.addEventListener("mousedown",g),window.addEventListener("mousemove",E),window.addEventListener("mouseup",R);let b=!1,T="",x=0;return{render(a,f){i(t);let v=t.width,A=t.height,g=f.pattern||"random",E=f.running??!0,R=f.speed??5;if(b&&g===T||(!function(t){for(let t of s)e.deleteTexture(t);for(let t of d)e.deleteFramebuffer(t);s.length=0,d.length=0;for(let r=0;r<2;r++){let o=e.createTexture();e.bindTexture(e.TEXTURE_2D,o),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,256,256,0,e.RGBA,e.UNSIGNED_BYTE,0===r?t:en()),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT);let a=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,a),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o,0),s.push(o),d.push(a)}e.bindFramebuffer(e.FRAMEBUFFER,null),_=0}(function(e){if("random"===e){let e=new Uint8Array(262144);for(let t=0;t<65536;t++){let r=255*(.3>Math.random()),o=4*t;e[o]=r,e[o+1]=r,e[o+2]=r,e[o+3]=255}return e}let t=en(),r=Math.floor(128),o=Math.floor(128);switch(e){case"glider":for(let e=0;e<5;e++)el(t,eu,r-40+15*e,o-40+15*e);break;case"gliderGun":el(t,ec,r-20,o-5);break;case"pulsar":el(t,ef,r,o);break;case"lwss":for(let e=0;e<4;e++)el(t,es,r-30,o-30+15*e)}return t}(g)),T=g,b=!0,x=0),E){let t,o,a=Math.max(1,Math.floor(21-R));++x%a==0&&(t=s[_],o=d[1-_],e.bindFramebuffer(e.FRAMEBUFFER,o),e.viewport(0,0,256,256),e.useProgram(r),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,t),e.uniform1i(n,0),e.uniform2f(l,256,256),m(r),_=1-_)}e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,v,A),e.useProgram(o),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,s[_]),e.uniform1i(u,0),e.uniform2f(c,v,A),m(o)},cleanup(){for(let r of(t.removeEventListener("mousedown",g),window.removeEventListener("mousemove",E),window.removeEventListener("mouseup",R),s))e.deleteTexture(r);for(let t of d)e.deleteFramebuffer(t);e.deleteBuffer(f),e.deleteProgram(r),e.deleteProgram(o)}}},"flow-field":function(e,t){let r=a(e,ed,e_),o=a(e,em,ev),n=a(e,eA,eg),l=e.getUniformLocation(r,"u_fadeAlpha"),u=e.getUniformLocation(n,"u_texture"),c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),e.STATIC_DRAW);let f=e.createBuffer(),s=new Float32Array(3e4),d=e.getAttribLocation(o,"a_position"),_=e.getAttribLocation(o,"a_color"),m=[];for(let e=0;e<5e3;e++)m.push({x:Math.random(),y:Math.random()});let v=null,A=null,g=0,E=0;function R(t){let r=e.getAttribLocation(t,"a_position");e.bindBuffer(e.ARRAY_BUFFER,c),e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLES,0,6)}return{render(a,c){i(t);let b=t.width,T=t.height;(b!==g||T!==E)&&(v&&e.deleteTexture(v),A&&e.deleteFramebuffer(A),v=e.createTexture(),e.bindTexture(e.TEXTURE_2D,v),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,b,T,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),A=e.createFramebuffer(),e.bindFramebuffer(e.FRAMEBUFFER,A),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,v,0),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,null),g=b,E=T);let x=c.speed??1,p=c.noiseScale??2,h=c.trail??10,F=c.colorMode||"flow",y=8e-5*a;for(let e=0;e<5e3;e++){let t,r,o,a,i=m[e],n=function(e,t){var r,o,a;let i=255&Math.floor(e),n=255&Math.floor(t),l=e-Math.floor(e),u=t-Math.floor(t),c=eR(l),f=eR(u),s=eE[eE[i]+n],d=eE[eE[i]+n+1],_=eE[eE[i+1]+n],m=eE[eE[i+1]+n+1];return a=(r=eb(s,l,u))+c*(eb(_,l-1,u)-r),a+f*((o=eb(d,l,u-1))+c*(eb(m,l-1,u-1)-o)-a)}(i.x*p,i.y*p+y)*Math.PI*2,l=.002*Math.cos(n)*x,u=.002*Math.sin(n)*x;i.x+=l,i.y+=u,(i.x<0||i.x>1||i.y<0||i.y>1)&&(i.x=Math.random(),i.y=Math.random());let c=2*i.x-1,f=2*i.y-1;if("rainbow"===F)[t,r,o]=eT(i.x),a=.7;else if("mono"===F)t=.3,r=.8,o=1,a=.6;else{let e=(n/(2*Math.PI)%1+1)%1;[t,r,o]=eT(e),a=.7}let d=6*e;s[d]=c,s[d+1]=f,s[d+2]=t,s[d+3]=r,s[d+4]=o,s[d+5]=a}e.bindFramebuffer(e.FRAMEBUFFER,A),e.viewport(0,0,b,T),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.useProgram(r),e.uniform1f(l,.2/h),R(r),e.blendFunc(e.SRC_ALPHA,e.ONE),e.useProgram(o),e.bindBuffer(e.ARRAY_BUFFER,f),e.bufferData(e.ARRAY_BUFFER,s,e.DYNAMIC_DRAW),e.enableVertexAttribArray(d),e.vertexAttribPointer(d,2,e.FLOAT,!1,24,0),e.enableVertexAttribArray(_),e.vertexAttribPointer(_,4,e.FLOAT,!1,24,8),e.drawArrays(e.POINTS,0,5e3),e.disable(e.BLEND),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,b,T),e.useProgram(n),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,v),e.uniform1i(u,0),R(n)},cleanup(){v&&e.deleteTexture(v),A&&e.deleteFramebuffer(A),e.deleteBuffer(c),e.deleteBuffer(f),e.deleteProgram(r),e.deleteProgram(o),e.deleteProgram(n)}}},"mutual-attraction":function(e,t){let r=a(e,ex,ep),o=a(e,eh,eF),n=a(e,ey,eU),l=a(e,eB,eL),u=e.getUniformLocation(r,"u_fadeAlpha"),c=e.getUniformLocation(l,"u_texture"),f=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,f),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),e.STATIC_DRAW);let s=e.createBuffer(),d=new Float32Array(700),_=e.getAttribLocation(o,"a_position"),m=e.getAttribLocation(o,"a_color"),v=e.getAttribLocation(o,"a_size"),A=e.createBuffer(),g=new Float32Array(6e3),E=e.getAttribLocation(n,"a_position"),R=e.getAttribLocation(n,"a_alpha"),b=function(){let e=[];for(let t=0;t<100;t++){let r=t/100*Math.PI*2,o=.2+.15*Math.random(),a=.5+Math.random(),i=.003+.002*Math.random(),[n,l,u]=function(e){let t=(1-Math.abs(1.2-1))*.75,r=t*(1-Math.abs(6*e%2-1)),o=.6-t/2,[a,i,n]=[[t,r,0],[r,t,0],[0,t,r],[0,r,t],[r,0,t],[t,0,r]][Math.floor(6*e)%6];return[a+o,i+o,n+o]}(t/100);e.push({x:Math.cos(r)*o,y:Math.sin(r)*o,vx:-Math.sin(r)*i,vy:Math.cos(r)*i,mass:a,r:n,g:l,b:u})}return e}(),T=null,x=null,p=0,h=0;function F(t){let r=e.getAttribLocation(t,"a_position");e.bindBuffer(e.ARRAY_BUFFER,f),e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLES,0,6)}let y=!1,U=0,B=0,L=e=>{e.preventDefault(),y=!0,D(e)},w=e=>{y&&D(e)},P=()=>{y=!1};function D(e){let r=t.getBoundingClientRect();U=(e.clientX-r.left)/r.width*2-1,B=(1-(e.clientY-r.top)/r.height)*2-1}return t.addEventListener("mousedown",L),window.addEventListener("mousemove",w),window.addEventListener("mouseup",P),{render(a,f){i(t);let L=t.width,w=t.height;(L!==p||w!==h)&&(T&&e.deleteTexture(T),x&&e.deleteFramebuffer(x),T=e.createTexture(),e.bindTexture(e.TEXTURE_2D,T),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,L,w,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),x=e.createFramebuffer(),e.bindFramebuffer(e.FRAMEBUFFER,x),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,T,0),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,null),p=L,h=w);let P=f.gravity??1,D=f.damping??.998,M=f.trail??8,S=f.showLines??!0,C=1e-5*P,N=b.length;for(let e=0;e<N;e++){let t=0,r=0,o=b[e];for(let a=0;a<N;a++){if(e===a)continue;let i=b[a],n=i.x-o.x,l=i.y-o.y,u=n*n+l*l+.01,c=C*o.mass*i.mass/u,f=Math.sqrt(u);t+=c*n/f,r+=c*l/f}if(y){let e=U-o.x,a=B-o.y,i=e*e+a*a+.01,n=C*o.mass*50/i,l=Math.sqrt(i);t+=n*e/l,r+=n*a/l}o.vx=(o.vx+t/o.mass)*D,o.vy=(o.vy+r/o.mass)*D,o.x+=o.vx,o.y+=o.vy,(o.x<-1.2||o.x>1.2)&&(o.vx*=-.5),(o.y<-1.2||o.y>1.2)&&(o.vy*=-.5),o.x=Math.max(-1.3,Math.min(1.3,o.x)),o.y=Math.max(-1.3,Math.min(1.3,o.y))}for(let e=0;e<N;e++){let t=b[e],r=7*e;d[r]=t.x,d[r+1]=t.y,d[r+2]=t.r,d[r+3]=t.g,d[r+4]=t.b,d[r+5]=.8,d[r+6]=3+5*t.mass}let I=0;if(S)for(let e=0;e<N&&I<2e3;e++)for(let t=e+1;t<N;t++){let r=b[t].x-b[e].x,o=b[t].y-b[e].y,a=Math.sqrt(r*r+o*o);if(a<.15){let r=1-a/.15,o=3*I;if(g[o]=b[e].x,g[o+1]=b[e].y,g[o+2]=r,g[o+3]=b[t].x,g[o+4]=b[t].y,g[o+5]=r,(I+=2)>=2e3)break}}e.bindFramebuffer(e.FRAMEBUFFER,x),e.viewport(0,0,L,w),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.useProgram(r),e.uniform1f(u,.2/M),F(r),e.blendFunc(e.SRC_ALPHA,e.ONE),S&&I>0&&(e.useProgram(n),e.bindBuffer(e.ARRAY_BUFFER,A),e.bufferData(e.ARRAY_BUFFER,g.subarray(0,3*I),e.DYNAMIC_DRAW),e.enableVertexAttribArray(E),e.vertexAttribPointer(E,2,e.FLOAT,!1,12,0),e.enableVertexAttribArray(R),e.vertexAttribPointer(R,1,e.FLOAT,!1,12,8),e.drawArrays(e.LINES,0,I)),e.useProgram(o),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,d,e.DYNAMIC_DRAW),e.enableVertexAttribArray(_),e.vertexAttribPointer(_,2,e.FLOAT,!1,28,0),e.enableVertexAttribArray(m),e.vertexAttribPointer(m,4,e.FLOAT,!1,28,8),e.enableVertexAttribArray(v),e.vertexAttribPointer(v,1,e.FLOAT,!1,28,24),e.drawArrays(e.POINTS,0,N),e.disable(e.BLEND),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,L,w),e.useProgram(l),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,T),e.uniform1i(c,0),F(l)},cleanup(){t.removeEventListener("mousedown",L),window.removeEventListener("mousemove",w),window.removeEventListener("mouseup",P),T&&e.deleteTexture(T),x&&e.deleteFramebuffer(x),e.deleteBuffer(f),e.deleteBuffer(s),e.deleteBuffer(A),e.deleteProgram(r),e.deleteProgram(o),e.deleteProgram(n),e.deleteProgram(l)}}}};function eq({slug:e,params:o}){let a=(0,r.useRef)(null),i=(0,r.useRef)(null),n=(0,r.useRef)(0),l=(0,r.useRef)(o);return l.current=o,(0,r.useEffect)(()=>{let t=a.current;if(!t)return;let r=t.getContext("webgl");if(!r)return;let o=eH[e]??null;if(!o)return;let u=o(r,t);i.current=u;let c=e=>{u.render(e,l.current),n.current=requestAnimationFrame(c)};return n.current=requestAnimationFrame(c),()=>{cancelAnimationFrame(n.current),u.cleanup(),i.current=null}},[e]),(0,t.jsx)("canvas",{ref:a,className:"h-full w-full rounded-xl"})}function e$({source:e}){let[o,a]=(0,r.useState)("vertex"),[i,n]=(0,r.useState)(0),[l,u]=(0,r.useState)(!1),c="vertex"===o?e.vertexShader:"fragment"===o?e.fragmentShaders[i]?.code??"":"",f=async()=>{await navigator.clipboard.writeText(c.trim()),u(!0),setTimeout(()=>u(!1),1500)};return(0,t.jsx)("div",{className:"mx-auto max-w-3xl",children:(0,t.jsxs)("div",{className:"overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-900",children:[(0,t.jsx)("div",{className:"flex",children:[{key:"vertex",label:"Vertex Shader"},{key:"fragment",label:"Fragment Shader"},{key:"description",label:"설명"}].map(e=>(0,t.jsx)("button",{onClick:()=>a(e.key),className:`px-3 py-2.5 text-xs font-medium transition-colors ${o===e.key?"border-b-2 border-blue-500 text-blue-600 dark:text-blue-400":"text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`,children:e.label},e.key))}),"description"!==o&&(0,t.jsx)("button",{onClick:f,className:"rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800",children:l?"복사됨":"복사"})]}),"fragment"===o&&e.fragmentShaders.length>1&&(0,t.jsx)("div",{className:"flex gap-1 border-b border-gray-200 bg-gray-50 px-4 py-1.5 dark:border-gray-700 dark:bg-gray-900",children:e.fragmentShaders.map((e,r)=>(0,t.jsx)("button",{onClick:()=>n(r),className:`rounded px-2 py-1 text-xs transition-colors ${i===r?"bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300":"text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"}`,children:e.label},r))}),"description"===o?(0,t.jsx)("div",{className:"p-4 text-sm text-gray-700 dark:text-gray-300",children:e.description}):(0,t.jsx)("div",{className:"max-h-96 overflow-auto bg-gray-950",children:(0,t.jsx)("pre",{className:"p-4",children:(0,t.jsx)("code",{className:"text-sm leading-relaxed",children:c.trim().split("\n").map((e,r)=>(0,t.jsxs)("div",{className:"flex",children:[(0,t.jsx)("span",{className:"mr-4 inline-block w-8 text-right text-gray-600 select-none",children:r+1}),(0,t.jsx)("span",{className:"text-gray-300",children:e})]},r))})})})]})})}function eK(e){let t={};for(let r of e)t[r.key]=r.defaultValue;return t}function eJ({params:e,values:r,onChange:o}){return 0===e.length?null:(0,t.jsxs)("div",{className:"mx-auto mt-4 max-w-3xl rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900",children:[(0,t.jsxs)("div",{className:"mb-3 flex items-center justify-between",children:[(0,t.jsx)("h3",{className:"text-sm font-semibold text-gray-700 dark:text-gray-300",children:"Controls"}),(0,t.jsx)("button",{onClick:()=>{for(let[t,r]of Object.entries(eK(e)))o(t,r)},className:"rounded-md px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800",children:"리셋"})]}),(0,t.jsx)("div",{className:"grid gap-4 sm:grid-cols-2",children:e.map(e=>(0,t.jsxs)("div",{children:["slider"===e.type&&(0,t.jsxs)("label",{className:"block",children:[(0,t.jsxs)("span",{className:"mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400",children:[(0,t.jsx)("span",{children:e.label}),(0,t.jsx)("span",{className:"font-mono",children:r[e.key]})]}),(0,t.jsx)("input",{type:"range",min:e.min,max:e.max,step:e.step,value:r[e.key],onChange:t=>o(e.key,parseFloat(t.target.value)),className:"w-full accent-blue-600"})]}),"color"===e.type&&(0,t.jsxs)("label",{className:"flex items-center gap-2",children:[(0,t.jsx)("input",{type:"color",value:r[e.key],onChange:t=>o(e.key,t.target.value),className:"h-8 w-8 cursor-pointer rounded border border-gray-300 dark:border-gray-600"}),(0,t.jsx)("span",{className:"text-xs text-gray-600 dark:text-gray-400",children:e.label})]}),"checkbox"===e.type&&(0,t.jsxs)("label",{className:"flex items-center gap-2",children:[(0,t.jsx)("input",{type:"checkbox",checked:r[e.key],onChange:t=>o(e.key,t.target.checked),className:"h-4 w-4 rounded accent-blue-600"}),(0,t.jsx)("span",{className:"text-xs text-gray-600 dark:text-gray-400",children:e.label})]}),"select"===e.type&&(0,t.jsxs)("label",{className:"block",children:[(0,t.jsx)("span",{className:"mb-1 block text-xs text-gray-600 dark:text-gray-400",children:e.label}),(0,t.jsx)("select",{value:r[e.key],onChange:t=>o(e.key,t.target.value),className:"w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200",children:e.options.map(e=>(0,t.jsx)("option",{value:e.value,children:e.label},e.value))})]})]},e.key))})]})}let eZ={triangle:{vertexShader:l,fragmentShaders:[{label:"Fragment",code:u}],description:"위치(x,y)와 색상(r,g,b)을 인터리브 버퍼로 전달. varying을 통해 프래그먼트 쉐이더로 색상 보간."},rectangle:{vertexShader:c,fragmentShaders:[{label:"Fragment",code:f}],description:"4개 꼭짓점 + 인덱스 버퍼(ELEMENT_ARRAY_BUFFER)로 2개의 삼각형을 구성해 사각형 렌더링."},colors:{vertexShader:s,fragmentShaders:[{label:"Fragment",code:d}],description:"각 꼭짓점에 커스텀 색상을 적용. Control Panel의 배경색 값을 gl.clearColor에 반영."},circle:{vertexShader:ew,fragmentShaders:[{label:"Fragment",code:eP}],description:"TRIANGLE_FAN으로 원 렌더링. segments 슬라이더로 다각형→원 변화. HSL 기반 무지개 색상."},blending:{vertexShader:eD,fragmentShaders:[{label:"Fragment",code:eM}],description:"gl.BLEND로 반투명 렌더링. 3개 원이 겹치며 블렌드 모드(일반/가산/곱셈) 비교."},translation:{vertexShader:_,fragmentShaders:[{label:"Fragment",code:m}],description:"uniform u_translation으로 x,y 오프셋을 전달. sin/cos 기반 애니메이션 루프."},rotation:{vertexShader:v,fragmentShaders:[{label:"Fragment",code:A}],description:"uniform u_angle로 회전 각도 전달. 버텍스 쉐이더에서 2D 회전 행렬 적용."},scale:{vertexShader:g,fragmentShaders:[{label:"Fragment",code:E}],description:"uniform u_scale로 크기 배율 전달. 슬라이더 값에 따라 실시간 크기 변경."},combined:{vertexShader:eC,fragmentShaders:[{label:"Fragment",code:eN}],description:"3x3 행렬로 이동+회전+스케일 복합 변환. 적용 순서(TRS/SRT 등)에 따른 결과 차이 비교."},ambient:{vertexShader:F,fragmentShaders:[{label:"Fragment",code:y}],description:"3D 큐브에 주변광 적용. MVP 행렬로 원근 투영 + 회전. ambientColor × ambientIntensity × objectColor."},diffuse:{vertexShader:U,fragmentShaders:[{label:"Fragment",code:B}],description:"노멀 벡터를 이용한 Lambert 확산 반사. dot(normal, lightDir)로 빛의 강도 계산."},specular:{vertexShader:eI,fragmentShaders:[{label:"Fragment",code:eO}],description:"Phong 반사 모델: ambient + diffuse + specular. reflect()와 shininess로 광택 하이라이트."},"point-light":{vertexShader:eY,fragmentShaders:[{label:"Fragment",code:eX}],description:"위치 기반 점광원. 거리 감쇠 1/(1+att*d²) 적용. 마우스로 광원 위치 실시간 이동."},"basic-texture":{vertexShader:L,fragmentShaders:[{label:"Fragment",code:w}],description:"프로시저럴 체커보드 텍스처 생성 후 texImage2D로 업로드. UV 좌표로 텍스처 매핑."},"multi-texture":{vertexShader:ek,fragmentShaders:[{label:"Fragment",code:eG}],description:"TEXTURE0/TEXTURE1 멀티 텍스처 유닛으로 체커보드+스트라이프 혼합. mix() 블렌딩."},"texture-wrapping":{vertexShader:ej,fragmentShaders:[{label:"Fragment",code:eW}],description:"REPEAT/MIRRORED_REPEAT/CLAMP_TO_EDGE 래핑 모드 비교. UV 스케일 확장으로 차이 시각화."},shader:{vertexShader:P,fragmentShaders:[{label:"기본",code:D},{label:"그라데이션",code:M},{label:"노이즈",code:S}],description:"풀스크린 쿼드에 프래그먼트 쉐이더 효과 적용. u_time, u_resolution uniform 활용."},particles:{vertexShader:O,fragmentShaders:[{label:"Fragment",code:Y}],description:"gl.POINTS로 300개 파티클 렌더링. JS에서 위치/속도/수명 업데이트 후 버퍼 갱신. 알파 블렌딩."},"solar-system":{vertexShader:k,fragmentShaders:[{label:"Fragment",code:G}],description:"3D 태양계 시뮬레이션. 구 메시 생성, 궤도 공전/자전, lookAt 기반 궤도 카메라, 디퓨즈 라이팅."},marbling:{vertexShader:H,fragmentShaders:[{label:"Drop",code:q},{label:"Tine",code:$},{label:"Swirl",code:K}],description:"Lu & Jaffe의 Mathematical Marbling 기반. 핑퐁 FBO로 역변환 샘플링, Drop/Tine/Swirl 연산."},"falling-sand":{vertexShader:Z,fragmentShaders:[{label:"Fragment",code:Q}],description:"셀룰러 오토마타 기반 낙하 모래. CPU 시뮬레이션 → texSubImage2D 업로드, NEAREST 필터링 픽셀 아트."},mandelbulb:{vertexShader:ee,fragmentShaders:[{label:"Fragment",code:et}],description:"Mandelbulb 3D 프랙탈. 구면 좌표 반복 + Distance Estimator로 레이마칭, Orbit Trap 색상 매핑."},"game-of-life":{vertexShader:eo,fragmentShaders:[{label:"Simulation",code:ea}],description:"Conway's Game of Life (B3/S23). GPU 핑퐁 FBO에서 Moore neighborhood 8방향 이웃 합산, 규칙 적용."},"flow-field":{vertexShader:em,fragmentShaders:[{label:"Fragment",code:ev}],description:"Perlin Noise Flow Field. 5000 파티클이 노이즈 벡터장을 따라 흐르며 잔상 누적. 가산 블렌딩."},"mutual-attraction":{vertexShader:eh,fragmentShaders:[{label:"Fragment",code:eF}],description:"N-body 중력 시뮬레이션. 100개 파티클 상호 인력, 소프트닝, 감쇠, 마우스 어트랙터. Trail FBO."}};function eQ({category:e,example:o}){let a=o.params??[],[i,n]=(0,r.useState)(()=>eK(a)),[l,u]=(0,r.useState)("canvas"),c=eZ[o.slug]??null;return(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"mb-4",children:[(0,t.jsx)("p",{className:"mb-1 text-sm text-gray-500 dark:text-gray-400",children:e.title}),(0,t.jsx)("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:o.title}),(0,t.jsx)("p",{className:"mt-1 text-gray-600 dark:text-gray-400",children:o.description})]}),(0,t.jsxs)("div",{className:"mx-auto mb-3 flex max-w-3xl gap-1",children:[(0,t.jsx)("button",{onClick:()=>u("canvas"),className:`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${"canvas"===l?"bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900":"text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"}`,children:"Canvas"}),(0,t.jsx)("button",{onClick:()=>u("code"),className:`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${"code"===l?"bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900":"text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"}`,children:"Code"})]}),"canvas"===l?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:"mx-auto max-w-3xl",children:(0,t.jsx)("div",{className:"aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-900 dark:border-gray-700",children:(0,t.jsx)(eq,{slug:o.slug,params:i})})}),(0,t.jsx)(eJ,{params:a,values:i,onChange:(e,t)=>{n(r=>({...r,[e]:t}))}})]}):c&&(0,t.jsx)(e$,{source:c})]})}e.s(["default",()=>eQ],34261)}]);