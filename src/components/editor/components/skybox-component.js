import * as THREE from 'three';
import BaseComponent from './base-component';

class SkyboxComponent extends BaseComponent {
  constructor(controller, images) {
    super();
    this.controller = controller;
    this.images = images;
  }

  start() {
    super.start();
    const { owner, images } = this;
    const geometry = new THREE.BoxGeometry(500, 500, 500);
    const material = [];
    for (let i = 0; i < 6; i += 1) {
      material.push(
        new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load(images[i]),
          side: THREE.BackSide,
        })
      );
    }
    owner.add(new THREE.Mesh(geometry, material));
    owner.children[0].castShadow = false;
    owner.children[0].receiveShadow = false;

    this.update.bind(this);
  }

  update(delta) {
    super.update(delta);
    const { controller, owner } = this;
    const controllerComponent = controller.findComponent('controller');
    owner.position.copy(controllerComponent.camera.position);
  }
}

export default SkyboxComponent;
