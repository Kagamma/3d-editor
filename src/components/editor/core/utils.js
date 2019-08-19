import * as THREE from 'three';

//

const min = (a, b) => {
  return a > b ? b : a;
};

const max = (a, b) => {
  return a < b ? b : a;
};

const clamp = (a, b, c) => {
  return min(b, max(c, a));
};

const degToRad = deg => {
  return deg * 0.0174532925199433;
};

const radToDeg = rad => {
  return rad * 57.295779513082321;
};

const clampAngle = rad => {
  const deg = radToDeg(rad);
  return degToRad(((deg % 360) + 360) % 360);
};

const sphericalToCartesdian = (radius, theta, phi) => {
  const result = new THREE.Vector3();
  result.x = radius * Math.sin(theta) * Math.cos(phi);
  result.y = radius * Math.sin(phi);
  result.z = radius * Math.cos(theta) * Math.cos(phi);
  return result;
};

const cartesdianToSpherical = point => {
  return {
    radius: Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z),
    theta: Math.atan2(point.x, point.z),
    phi: Math.atan2(point.y, Math.sqrt(point.x * point.x + point.z * point.z)),
  };
};

const lerp = (a, b, t) => {
  return a + (b - a) * t;
};

const clerp = (a, b, t) => {
  const t2 = (1 - Math.cos(t * Math.PI)) / 2;
  return a * (1 - t2) + b * t2;
};

// Generate 4x4 projection matrix from THREE.Plane
const matrix4ProjectFromPlane = plane => {
  const n = plane.normal;
  const d = plane.constant;
  return new THREE.Matrix4().set(
    1 - n.x * n.x,
    -n.x * n.y,
    -n.x * n.z,
    -n.x * d,
    -n.y * n.x,
    1 - n.y * n.y,
    -n.y * n.z,
    -n.y * d,
    -n.z * n.x,
    -n.z * n.y,
    1 - n.z * n.z,
    -n.z * d,
    0,
    0,
    0,
    1
  );
};

const exportTextToFile = (filename, data) => {
  const element = document.createElement('a');
  element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`;
  element.download = filename;
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const storeFileAsBase64 = file => {
  const fileReader = new FileReader();
  fileReader.onload = ({ target: { result } }) => {
    localStorage.removeItem('importedFile');
    localStorage.setItem('importedFile', result);
  };
  fileReader.onerror = ({ target: { error } }) => {
    localStorage.removeItem('importedFile');
    console.error(error.message);
  };
  fileReader.readAsDataURL(file);
};

const storeFileAsText = file => {
  const fileReader = new FileReader();
  fileReader.onload = ({ target: { result } }) => {
    localStorage.removeItem('importedFile');
    localStorage.setItem('importedFile', result);
  };
  fileReader.onerror = ({ target: { error } }) => {
    localStorage.removeItem('importedFile');
    console.error(error.message);
  };
  fileReader.readAsText(file);
};

export default {
  min,
  max,
  clamp,
  degToRad,
  radToDeg,
  clampAngle,
  sphericalToCartesdian,
  cartesdianToSpherical,
  lerp,
  clerp,
  matrix4ProjectFromPlane,
  exportTextToFile,
  storeFileAsBase64,
  storeFileAsText,
};
