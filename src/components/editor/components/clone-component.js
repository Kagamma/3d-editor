/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import BaseComponent from './base-component';
import ParameterComponent from './parameter-component';
import PickableComponent from './pickable-component';
import DraggableComponent from './draggable-component';
import ParameterUIComponent from './parameter-ui-component';
import SceneComponent from './scene-component';
import Entity from '../core/entity';

class CloneComponent extends BaseComponent {
  constructor(engine) {
    super();
    this.engine = engine;
  }

  start() {
    super.start();
    const { owner, engine } = this;
    const clone = new Entity(owner.parent, [], []);
    this.cloneRecursive(owner, clone);
    clone.name += ' copy';
    const controllerComponent = engine.controller.findComponent('controller');
    controllerComponent.selectEntity(clone);
    SceneComponent.isNeedUpdate = true;
    this.removeSelf = true;
  }

  cloneRecursive = (origin, clone) => {
    const { engine } = this;
    //
    clone.position.copy(origin.position);
    clone.quaternion.copy(origin.quaternion);
    clone.scale.copy(origin.scale);
    clone.name = origin.name;
    clone.addComponent('param', new ParameterComponent());
    if (origin.entityType !== 'Group') {
      clone.addComponent('pickable', new PickableComponent());
    }
    clone.addComponent('draggable', new DraggableComponent(engine));
    clone.addComponent('param-ui', new ParameterUIComponent(engine));
    clone.entityType = origin.entityType;
    clone.paramColor = origin.paramColor;
    clone.paramMap = origin.paramMap;
    clone.entityTypeProps = origin.entityTypeProps;
    //
    origin.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        const mesh = new THREE.Mesh(child.geometry.clone(), child.material.clone());
        mesh.position.copy(child.position);
        clone.add(mesh);
      } else if (child instanceof THREE.LineSegments) {
        const lines = new THREE.LineSegments(child.geometry.clone(), child.material.clone());
        clone.add(lines);
      } else if (child.entityType) {
        this.cloneRecursive(child, new Entity(clone, [], []));
      }
    });
  };
}

export default CloneComponent;
