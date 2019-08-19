import * as THREE from 'three';

const simpleFlatShadingVertex = () => {
  return `
    varying vec3 mNormal;
    varying vec3 mEye;

    void main() {
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

      mNormal = normalize((modelMatrix * vec4(normal, 1.0)).xyz);
      mEye = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);

      gl_Position = projectionMatrix * modelViewPosition;
    }
  `;
};

const simpleFlatShadingFragment = () => {
  return `
    uniform vec3 color;
    varying vec3 mNormal;
    varying vec3 mEye;

    void main() {
      float f = max(0.1, dot(mNormal, mEye));
      gl_FragColor = vec4(color * f, 1.0);
    }
  `;
};

export default {
  simpleFlatShading: {
    uniforms: {
      color: { type: 'vec3', value: new THREE.Color(0x00ff00) },
    },
    vertexShader: simpleFlatShadingVertex(),
    fragmentShader: simpleFlatShadingFragment(),
  },
};
