/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import { OBJLoader } from 'three-obj-mtl-loader';
import BaseComponent from './base-component';
import EdgeComponent from './edge-component';
import ParameterComponent from './parameter-component';
import PickableComponent from './pickable-component';
import DraggableComponent from './draggable-component';
import ParameterUIComponent from './parameter-ui-component';
import SceneComponent from './scene-component';
import Entity from '../core/entity';

class SceneImportComponent extends BaseComponent {
  constructor(engine, file) {
    super();
    this.engine = engine;
    const fileReader = new FileReader();
    fileReader.onload = result => {
      const src = result.target.result;
      if (this.isValidJSON(src)) {
        const data = JSON.parse(src);
        if (data.metadata.format === 'SCENE') {
          this.loadScene(engine.scene, data.children);
        }
      } else {
        // We assume this is an Obj file
        const objLoader = new OBJLoader();
        const objScene = objLoader.parse(src);
        // Add a new group to store obj file geommetries
        const group = new Entity(engine.scene);
        group.entityType = 'Group';
        group.addComponent('param', new ParameterComponent());
        group.addComponent('draggable', new DraggableComponent(engine));
        group.addComponent('param-ui', new ParameterUIComponent(engine));
        group.name = 'OBJ Model';
        // Load obj
        this.loadOBJScene(group, objScene.children);
      }
      SceneComponent.isNeedUpdate = true;
      this.removeSelf = true;
    };
    fileReader.readAsText(file);
  }

  loadScene = (parent, children) => {
    const { engine } = this;
    children.forEach(child => {
      const entity = new Entity(parent);
      switch (child.entityType) {
        case 'Group':
          this.loadScene(entity, child.children);
          break;
        default: {
          // TODO: Import Line? For now we generate line dynamically...
          entity.addComponent('pickable', new PickableComponent());

          const loader = new THREE.ObjectLoader();
          const buffGeoms = loader.parseGeometries([child.mesh.geometry]);
          let buffGeom;
          Object.keys(buffGeoms).forEach(key => {
            buffGeom = buffGeoms[key];
          });

          const geometry = new THREE.Geometry().fromBufferGeometry(buffGeom);
          geometry.mergeVertices();
          const material = new THREE.MeshPhongMaterial({ ...child.mesh.material });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = false;
          entity.add(mesh);
          entity.addComponent('edge', new EdgeComponent(true));
          // Auto generated line from geometry, this is not accurary btw ...
          break;
        }
      }
      entity.position.set(child.position.x, child.position.y, child.position.z);
      entity.rotation.set(child.rotation._x, child.rotation._y, child.rotation._z);
      entity.scale.set(child.scale.x, child.scale.y, child.scale.z);
      entity.addComponent('param', new ParameterComponent());
      entity.addComponent('draggable', new DraggableComponent(engine));
      entity.addComponent('param-ui', new ParameterUIComponent(engine));
      entity.entityType = child.entityType;
      entity.paramColor = child.paramColor;
      entity.paramMap = child.paramMap;
      entity.name = child.name;
      entity.visible = child.visible;
      entity.entityTypeProps = child.entityTypeProps;
      if (entity.paramMap.texture != null) {
        const map = THREE.ImageUtils.loadTexture(entity.paramMap.texture);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(entity.paramMap.repeatX, entity.paramMap.repeatY);
        entity.children[0].material.map = map;
        entity.children[0].material.needsUpdate = true;
      }
    });
  };

  loadOBJScene(parent, children) {
    const { engine } = this;
    children.forEach(child => {
      const mesh = new THREE.Geometry().fromBufferGeometry(child.geometry);
      mesh.mergeVertices();
      const entity = new Entity(parent);
      entity.add(
        new THREE.Mesh(
          mesh,
          new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 1,
            side: THREE.DoubleSide,
            transparent: true,
          })
        )
      );
      entity.position.copy(child.position);
      entity.quaternion.copy(child.quaternion);
      entity.scale.copy(child.scale);
      entity.addComponent('param', new ParameterComponent());
      entity.addComponent('pickable', new PickableComponent());
      entity.addComponent('edge', new EdgeComponent(true));
      entity.addComponent('draggable', new DraggableComponent(engine));
      entity.addComponent('param-ui', new ParameterUIComponent(engine));
      entity.paramColor = '#ffffff';
      entity.entityType = 'Free';
      entity.name = child.name;
    });
  }

  isValidJSON = str => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };
}

export default SceneImportComponent;
