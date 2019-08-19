/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import BaseComponent from './base-component';
import EdgeComponent from './edge-component';
import Utils from '../core/utils';

class ProjectComponent extends BaseComponent {
  start() {
    super.start();
    const { owner } = this;

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    owner.updateMatrixWorld();
    plane.applyMatrix4(owner.matrixWorld);

    owner.parent.traverse(entity => {
      if (
        entity !== owner &&
        entity.entityType &&
        entity.entityType !== 'Group' &&
        entity.entityType !== 'Line' &&
        entity.entityType !== 'Vertex' &&
        entity.entityType !== 'Cutting Plane'
      ) {
        const geom = entity.children[0].geometry;

        entity.updateMatrixWorld();
        const inverseMatrix = new THREE.Matrix4();
        inverseMatrix.getInverse(entity.matrixWorld);
        const projectMatrix = Utils.matrix4ProjectFromPlane(plane);

        geom.applyMatrix(entity.matrixWorld);
        geom.applyMatrix(projectMatrix);
        geom.applyMatrix(inverseMatrix);

        entity.children[0].geometry = geom;

        entity.addComponent('edge', new EdgeComponent(true));

        // Change entity type
        entity.entityType = 'Line';
      }
    });

    this.removeSelf = true;
  }
}

export default ProjectComponent;
