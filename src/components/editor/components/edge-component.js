/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import BaseComponent from './base-component';

const edgeEntities = [];
let edgeList = [];

class EdgeComponent extends BaseComponent {
  static attachEdges() {
    for (let i = 0; i < edgeEntities.length; i += 1) {
      const entity = edgeEntities[i];
      entity.add(edgeList[i].line);
    }
    edgeList = [];
  }

  static detachEdges() {
    for (let i = 0; i < edgeEntities.length; i += 1) {
      const entity = edgeEntities[i];
      edgeList.push({
        owner: entity,
        line: entity.children[1],
      });
      entity.remove(entity.children[1]);
    }
  }

  constructor(visible) {
    super();
    this.visible = !!visible;
  }

  start() {
    super.start();
    const { owner, visible } = this;

    const edgeGeom = new THREE.EdgesGeometry(owner.children[0].geometry);
    const lines = new THREE.LineSegments(edgeGeom, new THREE.LineBasicMaterial({ color: 0xffffff }));
    this.lines = lines;
    lines.visible = visible;
    lines.position.copy(owner.children[0].position);
    owner.add(lines);
    edgeEntities.push(owner);
  }

  stop() {
    const { owner, lines } = this;
    for (let i = edgeEntities.length - 1; i >= 0; i -= 1) {
      const entity = edgeEntities[i];
      if (owner === entity) {
        edgeEntities.splice(i, 1);
        break;
      }
    }
    for (let i = edgeList.length - 1; i >= 0; i -= 1) {
      const item = edgeList[i];
      if (owner === item.owner) {
        edgeList.splice(i, 1);
        break;
      }
    }
    owner.remove(lines);
    lines.geometry.dispose();
    lines.material.dispose();
  }
}

export default EdgeComponent;
