/**
 * 4x4 행렬 유틸리티 (column-major, WebGL 호환)
 */

export type Mat4 = Float32Array;

export function identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

export function perspective(
  fov: number,
  aspect: number,
  near: number,
  far: number
): Mat4 {
  const m = new Float32Array(16);
  const f = 1.0 / Math.tan(fov / 2);
  const rangeInv = 1 / (near - far);

  m[0] = f / aspect;
  m[5] = f;
  m[10] = (near + far) * rangeInv;
  m[11] = -1;
  m[14] = 2 * near * far * rangeInv;

  return m;
}

export function translate(m: Mat4, x: number, y: number, z: number): Mat4 {
  const out = new Float32Array(m);
  out[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
  out[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
  out[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
  out[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
  return out;
}

export function rotateX(m: Mat4, angle: number): Mat4 {
  const out = new Float32Array(m);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const a10 = m[4],
    a11 = m[5],
    a12 = m[6],
    a13 = m[7];
  const a20 = m[8],
    a21 = m[9],
    a22 = m[10],
    a23 = m[11];
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}

export function rotateY(m: Mat4, angle: number): Mat4 {
  const out = new Float32Array(m);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const a00 = m[0],
    a01 = m[1],
    a02 = m[2],
    a03 = m[3];
  const a20 = m[8],
    a21 = m[9],
    a22 = m[10],
    a23 = m[11];
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}

export function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      out[j * 4 + i] =
        a[i] * b[j * 4] +
        a[4 + i] * b[j * 4 + 1] +
        a[8 + i] * b[j * 4 + 2] +
        a[12 + i] * b[j * 4 + 3];
    }
  }
  return out;
}
