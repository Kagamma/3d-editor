/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import BaseComponent from './base-component';
import PickableComponent from './pickable-component';
import DraggableComponent from './draggable-component';
import * as MenuAction from '../../left-menu/actions';
import SceneComponent from './scene-component';
import SliceComponent from './slice-component';
import ProjectComponent from './project-component';

let currentOwner = null;

class ParameterUIComponent extends BaseComponent {
  constructor(engine) {
    super();
    this.isFocused = false;
    this.engine = engine;
  }

  deleteEntity = () => {
    this.removeOwner = true;
    PickableComponent.pickedEntity = null;
    DraggableComponent.axis.visible = false;
    MenuAction.removeMenuChilds('objectInfo');
    SceneComponent.isNeedUpdate = true;
  };

  update(delta) {
    super.update(delta);
    const { owner, engine } = this;

    if ((!this.isFocused || owner.isNeedUpdate) && owner === PickableComponent.pickedEntity) {
      this.isFocused = true;

      MenuAction.startBatch();
      MenuAction.removeMenuChilds('objectInfo');
      MenuAction.addMenuItem('objectInfo', {
        id: 'inputObjectName',
        type: 'input',
        label: 'Name',
        object: owner,
        property: 'name',
      });
      // Position
      MenuAction.addMenuItem('objectInfo', {
        id: 'inputObjectPosition',
        type: 'multiInput',
        label: 'Position',
        children: [
          {
            id: 'inputObjectPositionX',
            label: 'X',
            object: owner.position,
            property: 'x',
            inputType: 'number',
            step: 0.1,
          },
          {
            id: 'inputObjectPositionY',
            label: 'Y',
            object: owner.position,
            property: 'y',
            inputType: 'number',
            step: 0.1,
          },
          {
            id: 'inputObjectPositionZ',
            label: 'Z',
            object: owner.position,
            property: 'z',
            inputType: 'number',
            step: 0.1,
          },
        ],
      });
      // Rotation
      MenuAction.addMenuItem('objectInfo', {
        id: 'inputObjectRotation',
        type: 'multiInput',
        label: 'Rotation',
        children: [
          {
            id: 'inputObjectRotationX',
            label: 'X',
            object: owner.paramRotation,
            property: 'x',
            inputType: 'number',
          },
          {
            id: 'inputObjectRotationY',
            label: 'Y',
            object: owner.paramRotation,
            property: 'y',
            inputType: 'number',
          },
          {
            id: 'inputObjectRotationZ',
            label: 'Z',
            object: owner.paramRotation,
            property: 'z',
            inputType: 'number',
          },
        ],
      });
      // Scale
      MenuAction.addMenuItem('objectInfo', {
        id: 'inputObjectScale',
        type: 'multiInput',
        label: 'Scale',
        children: [
          {
            id: 'inputObjectScaleX',
            label: 'X',
            object: owner.scale,
            property: 'x',
            inputType: 'number',
            step: 0.1,
          },
          {
            id: 'inputObjectScaleY',
            label: 'Y',
            object: owner.scale,
            property: 'y',
            inputType: 'number',
            step: 0.1,
          },
          {
            id: 'inputObjectScaleZ',
            label: 'Z',
            object: owner.scale,
            property: 'z',
            inputType: 'number',
            step: 0.1,
          },
        ],
      });
      //
      if (owner.entityType !== 'Group' && owner.entityType !== 'Line') {
        // Additional info
        const controllerComponent = engine.controller.findComponent('controller');
        const fakePropsList = {
          [owner.entityType]: owner.entityTypeProps,
        };
        // controllerComponent.selectEntityProps[owner.entityType] = owner.entityTypeProps;
        controllerComponent.createObjectPropertiesMenu('objectInfo', owner.entityType, fakePropsList, () => {
          owner.children[0].geometry.dispose();
          owner.children[0].geometry = controllerComponent.createGeometry(owner.entityType, owner.entityTypeProps);
          owner.isNeedUpdate = true;
        });
        // Anchor
        MenuAction.addMenuItem('objectInfo', {
          id: 'inputObjectAnchor',
          type: 'multiInput',
          label: 'Anchor',
          children: [
            {
              id: 'inputObjectAnchorX',
              label: 'X',
              object: owner.children[0].position,
              property: 'x',
              inputType: 'number',
              step: 0.1,
              onChange: () => {
                owner.isNeedUpdate = true;
              },
            },
            {
              id: 'inputObjectAnchorY',
              label: 'Y',
              object: owner.children[0].position,
              property: 'y',
              inputType: 'number',
              step: 0.1,
              onChange: () => {
                owner.isNeedUpdate = true;
              },
            },
            {
              id: 'inputObjectAnchorZ',
              label: 'Z',
              object: owner.children[0].position,
              property: 'z',
              inputType: 'number',
              step: 0.1,
              onChange: () => {
                owner.isNeedUpdate = true;
              },
            },
          ],
        });
      }
      if (owner.entityType !== 'Group') {
        // visible or not
        MenuAction.addMenuItem('objectInfo', {
          id: 'inputObjectVisible',
          type: 'checkbox',
          label: 'Visible',
          object: owner,
          property: 'visible',
        });
        // wireframe or not
        MenuAction.addMenuItem('objectInfo', {
          id: 'inputObjectWireframe',
          type: 'checkbox',
          label: 'Wireframe',
          object: owner.children[0].material,
          property: 'wireframe',
        });
        // Change color
        MenuAction.addMenuItem('objectInfo', {
          id: 'inputObjectColor',
          type: 'colorpicker',
          label: 'Color',
          object: owner,
          property: 'paramColor',
        });
        // Change opacity
        MenuAction.addMenuItem('objectInfo', {
          id: 'inputObjectOpacity',
          type: 'input',
          inputType: 'number',
          label: 'Opacity',
          min: 0,
          max: 1,
          step: 0.1,
          object: owner.children[0].material,
          property: 'opacity',
        });
      }
      if (owner.entityType !== 'Group') {
        MenuAction.addMenuItem('objectInfo', {
          id: 'textureImportButton',
          type: 'import',
          label: 'Texture',
          name: 'Import',
          color: 'secondary',
          onClick: file => {
            const fileReader = new FileReader();
            fileReader.onload = result => {
              owner.paramMap.texture = result.target.result;
              const mesh = owner.children[0];
              const map = THREE.ImageUtils.loadTexture(owner.paramMap.texture);
              map.wrapS = THREE.RepeatWrapping;
              map.wrapT = THREE.RepeatWrapping;
              map.repeat.set(owner.paramMap.repeatX, owner.paramMap.repeatY);
              if (mesh.material.map) {
                mesh.material.map.dispose();
              }
              mesh.material.map = map;
              mesh.material.needsUpdate = true;
            };
            fileReader.readAsDataURL(file);
          },
        });
        // Texture scale
        MenuAction.addMenuItem('objectInfo', {
          id: 'inputObjectTextureScale',
          type: 'multiInput',
          label: 'Texture scale',
          children: [
            {
              id: 'materialRepeatX',
              label: 'X',
              object: owner.paramMap,
              property: 'repeatX',
              inputType: 'number',
              step: 0.1,
              onChange: () => {
                const mesh = owner.children[0];
                if (mesh.material.map) {
                  mesh.material.map.repeat.set(owner.paramMap.repeatX, owner.paramMap.repeatY);
                  mesh.material.needsUpdate = true;
                }
              },
            },
            {
              id: 'materialRepeatY',
              label: 'Y',
              object: owner.paramMap,
              property: 'repeatY',
              inputType: 'number',
              step: 0.1,
              onChange: () => {
                const mesh = owner.children[0];
                if (mesh.material.map) {
                  mesh.material.map.repeat.set(owner.paramMap.repeatX, owner.paramMap.repeatY);
                  mesh.material.needsUpdate = true;
                }
              },
            },
          ],
        });
      }
      if (owner.entityType === 'Cutting Plane') {
        // Slice
        MenuAction.addMenuItem('objectInfo', {
          id: 'buttonSliceEntity',
          type: 'button',
          label: ' ',
          name: 'Slice',
          color: 'primary',
          onClick: () => {
            owner.addComponent('slice', new SliceComponent());
          },
        });
        // Project
        MenuAction.addMenuItem('objectInfo', {
          id: 'buttonProjectEntity',
          type: 'button',
          label: ' ',
          name: 'Project',
          color: 'primary',
          onClick: () => {
            owner.addComponent('project', new ProjectComponent());
          },
        });
      }
      // Delete entity button
      MenuAction.addMenuItem('objectInfo', {
        id: 'buttonDeleteEntity',
        type: 'button',
        label: ' ',
        name: 'Delete',
        color: 'secondary',
        onClick: () => {
          this.deleteEntity();
        },
      });
      MenuAction.endBatch();
      currentOwner = owner;
    } else if (this.isFocused && owner !== PickableComponent.pickedEntity) {
      this.isFocused = false;
      if (currentOwner !== PickableComponent.pickedEntity) {
        MenuAction.removeMenuChilds('objectInfo');
      }
    }
  }
}

export default ParameterUIComponent;
