import * as THREE from 'three';
import Entity from './entity';
import ControllerComponent from '../components/controller-component';
import SkyboxComponent from '../components/skybox-component';
import SceneComponent from '../components/scene-component';

class Engine {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    const scene = new THREE.Scene();
    this.scene = scene;

    const noDepthScene = new THREE.Scene();
    this.noDepthScene = noDepthScene;

    const grid = new THREE.GridHelper(100, 50);
    scene.add(grid);

    const controller = new Entity(scene);
    controller.addComponent('scene', new SceneComponent(this));
    controller.addComponent('controller', new ControllerComponent(this));
    this.controller = controller;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor('#202020');
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowCameraNear = 3;
    renderer.shadowCameraFar = 100;
    renderer.shadowCameraFov = 130;
    renderer.autoClear = false;
    this.renderer = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    noDepthScene.add(new THREE.AmbientLight(0xffffff, 0.8));

    // postprocessing stuff
    // highlight
    this.highlightedObjects = [];
    //

    const directionalLight = new THREE.DirectionalLight(0x808080, 1);
    directionalLight.position.set(-25, 25, -5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    const sides = ['nx', 'px', 'py', 'ny', 'nz', 'pz'];
    const names = [];
    for (let i = 0; i < 6; i += 1) {
      names.push(`images/${sides[i]}.jpg`);
    }
    const skybox = new Entity(scene);
    skybox.name = '__skybox';
    skybox.addComponent('skybox', new SkyboxComponent(controller, names));
    skybox.visible = false;

    const grassTexture = new THREE.TextureLoader().load(`images/green1.jpg`);
    grassTexture.repeat.set(50, 50);
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    const plane = new Entity(
      scene,
      [new THREE.PlaneGeometry(500, 500)],
      [
        new THREE.MeshLambertMaterial({
          color: 0xa0a0a0,
          map: grassTexture,
        }),
      ]
    );
    plane.name = '__ground';
    plane.rotation.x = -(180 * Math.PI) / 360;
    plane.children[0].castShadow = false;
    plane.children[0].receiveShadow = true;
    plane.visible = false;

    this.inputMouse = {
      x: 0,
      y: 0,
      left: false,
      middle: false,
      right: false,
      which: 0,
      type: null,
    };
    this.inputKeys = {
      keys: {},
      type: null,
    };
    this.ticks = 0;
  }

  resize = (width, height) => {
    const { renderer } = this;
    this.width = width;
    this.height = height;
    renderer.setSize(width, height);
  };

  updateRecursive(entity) {
    if (entity.update) {
      entity.update(1 / 60);
    }
    for (let i = entity.children.length - 1; i >= 0; i -= 1) {
      this.updateRecursive(entity.children[i]);
    }
  }

  update = () => {
    const { scene, noDepthScene } = this;
    for (let i = scene.children.length - 1; i >= 0; i -= 1) {
      this.updateRecursive(scene.children[i]);
    }
    for (let i = noDepthScene.children.length - 1; i >= 0; i -= 1) {
      this.updateRecursive(noDepthScene.children[i]);
    }
    this.render();
  };

  render = () => {
    const { scene, noDepthScene } = this;
    if (true) {
      // (this.ticks % 1 === 0) {
      const controllerComponent = this.controller.findComponent('controller');
      const { camera } = controllerComponent;
      this.renderer.clear();

      this.renderer.render(scene, camera);
      this.renderer.clearDepth();
      // compose.render(scene, camera);
      this.renderer.render(noDepthScene, camera);
    }
    this.ticks += 1;
  };
}

export default Engine;
