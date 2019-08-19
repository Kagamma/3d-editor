/**
 * Trung:
 * Common 2D utils goes here
 * This file is independent from any libraries, including three.js
 */

// Trung:
// 2D vector routines

const EPSILON = 1e-10;

class Vector {
  /**
   * Find intersection point between 2 lines, return either vector or null
   * @param {*} a start of line1
   * @param {*} b end of line1
   * @param {*} c start of line2
   * @param {*} d end of line2
   */
  static intersect(a, b, c, d) {
    const d1 = a.cross(b);
    const d2 = c.cross(d);
    const ambx = a.x - b.x;
    const cmdx = c.x - d.x;
    const amby = a.y - b.y;
    const cmdy = c.y - d.y;
    const xnorm = new Vector(d1, ambx).cross(new Vector(d2, cmdx));
    const ynorm = new Vector(d1, amby).cross(new Vector(d2, cmdy));
    const denom = new Vector(ambx, amby).cross(new Vector(cmdx, cmdy));
    if (denom < EPSILON) {
      return null;
    }
    const x = xnorm / denom;
    const y = ynorm / denom;
    if (!x || !y) {
      return null;
    }
    return new Vector(x, y);
  }

  constructor(x = 0, y = 0, z = 1) {
    this.set(x, y, z);
    return this;
  }

  clone() {
    return new Vector(this.x, this.y, this.z);
  }

  set(x = 0, y = 0, z = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  createAngle(a) {
    this.x = Math.cos(a);
    this.y = Math.sin(a);
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  normalize() {
    const len = this.length();
    return this.set(this.x / len, this.y / len);
  }

  multMatrix(mat) {
    const m = mat.data;
    const x = m[0] * this.x + m[1] * this.y + m[2] * this.z;
    const y = m[3] * this.x + m[4] * this.y + m[5] * this.z;
    const z = m[6] * this.x + m[7] * this.y + m[8] * this.z;
    this.set(x, y, z);
    return this;
  }
}

// Trung:
// 2D matrix routines
// NOTE: We use row-order matrix which doesnt follow WebGL matrix layout
//       In case we need to use WebGL, a transpose operation may be needed

class Matrix {
  constructor() {
    this.identity();
    return this;
  }

  clone() {
    const m = new Matrix();
    m.data = this.data.slice();
    return m;
  }

  identity() {
    // eslint-disable-next-line prettier/prettier
    this.data = [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
    return this;
  }

  createTranslate(x, y) {
    // eslint-disable-next-line prettier/prettier
    this.data = [
      1, 0, x,
      0, 1, y,
      0, 0, 1,
    ];
    return this;
  }

  createScale(x = 1, y = 1) {
    // eslint-disable-next-line prettier/prettier
    this.data = [
      x, 0, 0,
      0, y, 0,
      0, 0, 1
    ];
    return this;
  }

  createAngle(a) {
    // eslint-disable-next-line prettier/prettier
    this.data = [
      Math.cos(a), -Math.sin(a), 0,
      Math.sin(a), Math.cos(a), 0,
      0, 0, 1
    ];
    return this;
  }

  det() {
    const m = this.data;
    const da = m[4] * m[8] - m[7] * m[5];
    const db = m[3] * m[8] - m[5] * m[6];
    const dc = m[3] * m[7] - m[4] * m[6];
    return m[0] * da - m[1] * db + m[2] * dc;
  }

  transpose() {
    const m = this.data.slice();
    // eslint-disable-next-line prettier/prettier
    this.data = [
      m[0], m[3], m[6],
      m[1], m[4], m[7],
      m[2], m[5], m[8]
    ];
    return this;
  }

  inverse() {
    const det = this.det();
    if (det < EPSILON) {
      return this.identity();
    }
    const invdet = 1 / this.det();
    const m = this.data;
    this.data = [
      (m[4] * m[8] - m[7] * m[5]) / invdet,
      (m[2] * m[3] - m[2] * m[8]) / invdet,
      (m[1] * m[5] - m[2] * m[4]) / invdet,
      (m[5] * m[6] - m[3] * m[8]) / invdet,
      (m[0] * m[8] - m[2] * m[6]) / invdet,
      (m[3] * m[2] - m[0] * m[5]) / invdet,
      (m[3] * m[7] - m[6] * m[4]) / invdet,
      (m[6] * m[1] - m[0] * m[7]) / invdet,
      (m[0] * m[4] - m[3] * m[2]) / invdet,
    ];
    return this;
  }

  mult(mat) {
    const m1 = this.data.slice();
    const m2 = mat.data;
    this.data = [
      m1[0] * m2[0] + m1[1] * m2[3] + m1[2] * m2[6],
      m1[0] * m2[1] + m1[1] * m2[4] + m1[2] * m2[7],
      m1[0] * m2[2] + m1[1] * m2[5] + m1[2] * m2[8],
      m1[3] * m2[0] + m1[4] * m2[3] + m1[5] * m2[6],
      m1[3] * m2[1] + m1[4] * m2[4] + m1[5] * m2[7],
      m1[3] * m2[2] + m1[4] * m2[5] + m1[5] * m2[8],
      m1[6] * m2[0] + m1[7] * m2[3] + m1[8] * m2[6],
      m1[6] * m2[1] + m1[7] * m2[4] + m1[8] * m2[7],
      m1[6] * m2[2] + m1[7] * m2[5] + m1[8] * m2[8],
    ];
    return this;
  }
}

export { Vector, Matrix };
