/* eslint-disable no-param-reassign */
import * as THREE from 'three';

class Entity extends THREE.Object3D {
  /**
   * NOTE: parent can be considered as "parent", and it can either be THREE.Scene, or Entity
   */
  constructor(parent, geometries, materials) {
    super();
    if (geometries) {
      for (let i = 0; i < geometries.length; i += 1) {
        this.add(new THREE.Mesh(geometries[i], materials[i]));
      }
    }
    this.setParent(parent);
    this.components = [];
    this.isNeedUpdate = false;

    this.update.bind(this);
  }

  update(delta) {
    const { parent, components, children } = this;
    let isRemoveSelf = this.removeSelf;
    for (let i = components.length - 1; i >= 0; i -= 1) {
      const component = components[i];
      if (!isRemoveSelf && component.removeOwner) {
        isRemoveSelf = true;
      }
      if (component.removeSelf) {
        this.removeComponent(component.name);
      } else {
        component.update(delta);
      }
    }
    this.isNeedUpdate = false;
    if (isRemoveSelf) {
      for (let j = components.length - 1; j >= 0; j -= 1) {
        this.removeComponent(components[j].name);
      }
      for (let i = children.length; i >= 0; i -= 1) {
        const child = children[i];
        if (child instanceof Entity) {
          child.removeSelf = true;
          child.update(0);
        }
      }
      parent.remove(this);
      this.cleanUpResources();
    }
  }

  cleanUpResources() {
    this.children.forEach(child => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
  }

  setParent(parent) {
    if (this.parent) {
      this.parent.remove(this);
    }
    if (parent) {
      parent.add(this);
    }
    this.parent = parent;
  }

  /**
   * Change this component's parent. This will also update the world position according to parent.
   * @param {*} newScene
   */
  setParentRetainPosition(newScene) {
    const oldPos = new THREE.Vector3();
    this.getWorldPosition(oldPos);
    this.parent.remove(this);
    newScene.add(this);
    this.parent = newScene;

    const newPos = new THREE.Vector3();
    this.getWorldPosition(newPos);
    const v = new THREE.Vector3().subVectors(oldPos, newPos);
    this.position.add(v);

    this.isNeedUpdate = true;
  }

  /**
   * Add a new component
   * @param name Name of the component
   * @param comp Component
   */
  addComponent(name, comp) {
    this.removeComponent(name);
    const { components } = this;
    const localComp = comp;
    localComp.name = name;
    localComp.owner = this;
    components.push(localComp);
    localComp.start();
  }

  /**
   * Remove component by name
   * @param name Name of the component
   */
  removeComponent(name) {
    const { components } = this;
    const container = this.findComponentWithIndex(name);
    if (container.index >= 0) {
      components.splice(container.index, 1);
      container.data.stop();
    }
  }

  /**
   * Find component by name
   * @param name Name of the component
   */
  findComponentWithIndex(name) {
    const { components } = this;
    for (let i = components.length - 1; i >= 0; i -= 1) {
      const component = components[i];
      if (component.name === name) {
        return {
          index: i,
          data: component,
        };
      }
    }
    return {
      index: -1,
      data: null,
    };
  }

  /**
   * Find component by name
   * @param name Name of the component
   */
  findComponent(name) {
    const { components } = this;
    for (let i = components.length - 1; i >= 0; i -= 1) {
      const component = components[i];
      if (component.name === name) {
        return component;
      }
    }
    return null;
  }
}

export default Entity;
