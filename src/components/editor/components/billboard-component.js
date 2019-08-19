/* eslint-disable no-param-reassign */
import BaseComponent from './base-component';

class BillboardComponent extends BaseComponent {
  constructor(engine) {
    super();
    this.engine = engine;
    this.controller = engine.controller;
    this.controllerComponent = engine.controller.findComponent('controller');
  }

  update() {
    super.update();
    const { owner, controllerComponent } = this;
    const { camera, cameraProps, cameraMode } = controllerComponent;
    owner.quaternion.copy(camera.quaternion);
    let s = cameraMode === 'Perspective' ? cameraProps.spherical.radius * 0.1 : 1;
    if (s < 0.5) {
      s = 0.5;
    }
    owner.scale.set(s, s, s);
  }
}

export default BillboardComponent;
