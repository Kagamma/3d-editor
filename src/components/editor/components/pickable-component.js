import BaseComponent from './base-component';

class PickableComponent extends BaseComponent {
  static pickableEntities = [];

  static pickedEntity = null;

  static pickedMultipleEntities = [];

  start() {
    super.start();
    PickableComponent.pickableEntities.push(this.owner);
  }

  stop() {
    super.stop();
    const { owner } = this;
    for (let i = PickableComponent.pickableEntities.length - 1; i >= 0; i -= 1) {
      const object = PickableComponent.pickableEntities[i];
      if (owner === object) {
        PickableComponent.pickableEntities.splice(i, 1);
        break;
      }
    }
    if (PickableComponent.pickedEntity === owner) {
      PickableComponent.pickedEntity = null;
    }
  }
}

export default PickableComponent;
