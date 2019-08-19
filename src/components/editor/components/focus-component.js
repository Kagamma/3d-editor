import * as THREE from 'three';
import BaseComponent from './base-component';
import Utils from '../core/utils';

class FocusComponent extends BaseComponent {
  static focusedEntity = null;

  constructor(camera, startVector, endVector, cameraProps) {
    super();
    this.camera = camera;
    this.startVector = startVector;
    this.endVector = endVector;
    // cameraProps
    this.cameraProps = cameraProps;
    this.step = 0;
  }

  start() {
    FocusComponent.focusedEntity = this.owner;
  }

  update(delta) {
    super.update(delta);
    const { startVector, endVector, cameraProps } = this;
    if (FocusComponent.focusedEntity !== this.owner) {
      this.removeSelf = true;
      return;
    }
    this.step += 0.025;
    if (this.step > 1) {
      this.step = 1;
      this.removeSelf = true;
    }
    //
    cameraProps.target.set(
      Utils.clerp(startVector.x, endVector.x, this.step),
      Utils.clerp(startVector.y, endVector.y, this.step),
      Utils.clerp(startVector.z, endVector.z, this.step)
    );
    this.camera.lookAt(cameraProps.target);
    // Calculate theta and phi for the next target
    const coords = new THREE.Vector3().subVectors(this.camera.position, cameraProps.target);
    cameraProps.spherical = Utils.cartesdianToSpherical(coords);
    //
  }
}

export default FocusComponent;
