import * as THREE from 'three';
import BaseComponent from './base-component';
import DraggableComponent from './draggable-component';
import Utils from '../core/utils';

class ParameterComponent extends BaseComponent {
  start() {
    super.start();
    const { owner } = this;
    owner.paramSelectedVertices = [];
    owner.paramRotation = new THREE.Vector3(
      Utils.radToDeg(owner.rotation.x),
      Utils.radToDeg(owner.rotation.y),
      Utils.radToDeg(owner.rotation.z)
    );
    owner.paramMap = {
      texture: null,
      repeatX: 1,
      repeatY: 1,
    };
    this.backupRotation = owner.paramRotation.clone();
    this.backupPosition = owner.position.clone();
    this.backupScale = owner.scale.clone();
    this.backupColor = owner.color;
  }

  updateRotationX() {
    const { owner } = this;
    if (this.backupRotation.x !== owner.paramRotation.x) {
      const ha = Utils.degToRad(owner.paramRotation.x - this.backupRotation.x) / 2;
      const q = new THREE.Quaternion(Math.sin(ha), 0, 0, Math.cos(ha));
      owner.quaternion.multiply(q);
      owner.paramRotation.y = Utils.radToDeg(owner.rotation.y);
      owner.paramRotation.z = Utils.radToDeg(owner.rotation.z);
      this.backupRotation.copy(owner.paramRotation);
      // Manually call colorize component update() to update rotaion of wireframe
      const colorizeComponent = owner.findComponent('colorize');
      if (colorizeComponent) {
        colorizeComponent.update();
      }
    }
  }

  updateRotationY() {
    const { owner } = this;
    if (this.backupRotation.y !== owner.paramRotation.y) {
      const ha = Utils.degToRad(owner.paramRotation.y - this.backupRotation.y) / 2;
      const q = new THREE.Quaternion(0, Math.sin(ha), 0, Math.cos(ha));
      owner.quaternion.multiply(q);
      owner.paramRotation.x = Utils.radToDeg(owner.rotation.x);
      owner.paramRotation.z = Utils.radToDeg(owner.rotation.z);
      this.backupRotation.copy(owner.paramRotation);
      // Manually call colorize component update() to update rotaion of wireframe
      const colorizeComponent = owner.findComponent('colorize');
      if (colorizeComponent) {
        colorizeComponent.update();
      }
    }
  }

  updateRotationZ() {
    const { owner } = this;
    if (this.backupRotation.z !== owner.paramRotation.z) {
      const ha = Utils.degToRad(owner.paramRotation.z - this.backupRotation.z) / 2;
      const q = new THREE.Quaternion(0, 0, Math.sin(ha), Math.cos(ha));
      owner.quaternion.multiply(q);
      owner.paramRotation.x = Utils.radToDeg(owner.rotation.x);
      owner.paramRotation.y = Utils.radToDeg(owner.rotation.y);
      this.backupRotation.copy(owner.paramRotation);
      // Manually call colorize component update() to update rotaion of wireframe
      const colorizeComponent = owner.findComponent('colorize');
      if (colorizeComponent) {
        colorizeComponent.update();
      }
    }
  }

  update() {
    super.update();

    const { owner } = this;
    const { currentAxis } = DraggableComponent;

    // Material color
    if (owner.paramColor && this.backupColor !== owner.paramColor) {
      const color = parseInt(owner.paramColor.replace('#', ''), 16);
      owner.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.material.color.set(color);
        }
      });
      this.backupColor = owner.paramColor;
    }
    // Rotation
    switch (currentAxis) {
      case 'x':
        this.updateRotationX();
        break;
      case 'y':
        this.updateRotationY();
        break;
      case 'z':
        this.updateRotationZ();
        break;
      default:
        this.updateRotationX();
        this.updateRotationY();
        this.updateRotationZ();
        break;
    }
  }
}

export default ParameterComponent;
