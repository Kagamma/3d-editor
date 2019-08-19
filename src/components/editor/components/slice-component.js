/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import * as SliceGeometry from 'threejs-slice-geometry';
import BaseComponent from './base-component';
import EdgeComponent from './edge-component';

class SliceComponent extends BaseComponent {
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
        let geom = entity.children[0].geometry;
        const sliceGeometryFunc = SliceGeometry(THREE);

        entity.updateMatrixWorld();
        const inverseMatrix = new THREE.Matrix4();
        inverseMatrix.getInverse(entity.matrixWorld);

        geom.applyMatrix(entity.matrixWorld);
        geom = sliceGeometryFunc(geom, plane);
        geom.applyMatrix(inverseMatrix);

        entity.children[0].geometry = geom;
        entity.addComponent('edge', new EdgeComponent(true));
        // Change entity type
        entity.entityType = 'Free';
      }
    });

    this.removeSelf = true;
  }
}

export default SliceComponent;
