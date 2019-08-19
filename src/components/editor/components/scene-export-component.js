/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import BaseComponent from './base-component';
import Utils from '../core/utils';

class SceneExportComponent extends BaseComponent {
  constructor(engine) {
    super();
    const sceneJson = {
      metadata: {
        format: 'SCENE',
      },
    };
    this.convertSceneToJson(sceneJson, engine.scene.children);
    Utils.exportTextToFile('scene.json', JSON.stringify(sceneJson));
    this.removeSelf = true;
  }

  convertSceneToJson = (parent, children) => {
    parent.children = [];
    children.forEach(child => {
      if (child.entityType) {
        const childObj = {};
        childObj.entityType = child.entityType;
        childObj.position = child.position.clone();
        childObj.rotation = child.rotation.clone();
        childObj.scale = child.scale.clone();
        childObj.paramColor = child.paramColor;
        childObj.paramMap = child.paramMap;
        childObj.name = child.name;
        childObj.id = child.id;
        childObj.uuid = child.uuid;
        childObj.visible = child.visible;
        childObj.entityTypeProps = child.entityTypeProps;
        childObj.mesh = {};
        switch (child.entityType) {
          case 'Group':
            this.convertSceneToJson(childObj, child.children);
            break;
          default:
            childObj.mesh.geometry = new THREE.BufferGeometry().fromGeometry(child.children[0].geometry);
            childObj.mesh.material = child.children[0].material.clone();
            childObj.mesh.material.map = null;
            if (child.entityType === 'Line') {
              childObj.mesh.lineGeometry = child.children[1].geometry;
            }
            break;
        }
        parent.children.push(childObj);
      }
    });
  };
}

export default SceneExportComponent;
