import * as THREE from 'three';
import BaseComponent from './base-component';

class PickableVertexComponent extends BaseComponent {
  constructor(engine) {
    super();
    this.engine = engine;
    this.controller = engine.controller;
    this.controllerComponent = this.controller.findComponent('controller');
    this.camera = this.controllerComponent.camera;
  }

  start() {
    const { owner, engine, camera } = this;

    const mouse = new THREE.Vector2(
      (engine.inputMouse.x / engine.width) * 2 - 1,
      (1 - engine.inputMouse.y / engine.height) * 2 - 1
    );
    const ray = new THREE.Raycaster();
    ray.params.Points.threshold = 0.1;
    ray.setFromCamera(mouse, camera);
    const intersects = ray.intersectObjects(owner.paramVertexGroup.children, true);
    if (intersects.length > 0) {
      const vertexEntity = intersects[0].object.parent;
      if (engine.inputKeys.keys.Shift) {
        let isHighlighted = false;
        for (let i = 0; i < owner.paramSelectedVertices.length; i += 1) {
          const child = owner.paramSelectedVertices[i];
          if (child === vertexEntity) {
            isHighlighted = true;
            child.children[0].material.color.setHex(0x00b000);
            owner.paramSelectedVertices.splice(i, 1);
            break;
          }
        }
        if (!isHighlighted) {
          owner.paramSelectedVertices.push(vertexEntity);
          vertexEntity.children[0].material.color.setHex(0xffff00);
        }
      } else {
        for (let i = 0; i < owner.paramSelectedVertices.length; i += 1) {
          const child = owner.paramSelectedVertices[i];
          child.children[0].material.color.setHex(0x00b000);
        }
        owner.paramSelectedVertices = [];
        owner.paramSelectedVertices.push(vertexEntity);
        vertexEntity.children[0].material.color.setHex(0xffff00);
      }
    }
    this.removeSelf = true;
  }
}

export default PickableVertexComponent;
