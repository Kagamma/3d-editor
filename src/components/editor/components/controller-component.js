import * as THREE from 'three';
import BaseComponent from './base-component';
import Entity from '../core/entity';
import Utils from '../core/utils';
import FocusComponent from './focus-component';
import ColorizeComponent from './colorize-component';
import ParameterComponent from './parameter-component';
import PickableComponent from './pickable-component';
import DraggableComponent from './draggable-component';
import CloneComponent from './clone-component';
import ParameterUIComponent from './parameter-ui-component';
import SceneComponent from './scene-component';
import SceneExportComponent from './scene-export-component';
import SceneImportComponent from './scene-import-component';
import * as ContextMenuAction from '../../context-menu/actions';
import * as MenuAction from '../../left-menu/actions';
import EdgeComponent from './edge-component';
import PickableVertexComponent from './pickable-vertex-component';

const EntityType = {
  CuttingPlane: 'Cutting Plane',
  Plane: 'Plane',
  Cube: 'Cube',
  Sphere: 'Sphere',
  Torus: 'Torus',
  Cylinder: 'Cylinder',
  Tube: 'Tube',
  Group: 'Group',
  // Not showing on menu but they do exists...
  // Line: Line
  // Free: Free
  // Vertex: Vertex
};

const EditMode = {
  Object: 'Object',
  Vertex: 'Vertex',
};

// eslint-disable-next-line no-inner-declarations
function CustomSinCurve(scale) {
  THREE.Curve.call(this);
  this.scale = scale === undefined ? 1 : scale;
}
CustomSinCurve.prototype = Object.create(THREE.Curve.prototype);
CustomSinCurve.prototype.constructor = CustomSinCurve;
// eslint-disable-next-line func-names
CustomSinCurve.prototype.getPoint = function(t) {
  const tx = t * 3 - 1.5;
  const ty = Math.sin(2 * Math.PI * t);
  const tz = 0;
  return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
};

const objectProps = () => {
  return {
    [EntityType.Cube]: {
      widthSegments: 1,
      heightSegments: 1,
      depthSegments: 1,
    },
    [EntityType.Sphere]: {
      widthSegments: 12,
      heightSegments: 12,
    },
    [EntityType.Cylinder]: {
      radialSegments: 8,
      heightSegments: 1,
    },
    [EntityType.Tube]: {
      path: 1,
      tubularSegments: 32,
      radius: 0.1,
      radialSegments: 8,
    },
  };
};

class ControllerComponent extends BaseComponent {
  constructor(engine) {
    super();
    this.engine = engine;

    this.dragMode = 'Translate';
    this.editMode = 'Object';
    this.createEntityType = 'Cube';
    this.createPosition = new THREE.Vector3(0, 0.5, 0);
    this.cameraMode = 'Perspective';
    this.cameraViewMode = 'Free';
    this.isShowEnvironment = false;
    this.count = 0;
    // True if controller is in dragging mode
    this.isDragging = false;

    this.update.bind(this);
  }

  start() {
    super.start();
    const { owner, engine } = this;
    const { parent } = owner;

    owner.visible = false;
    // this.headLight = new THREE.PointLight(0xffffff, 5, 50, 30);
    owner.name = 'controller';
    this.engine = engine;

    // Create cameras
    this.initCamera();

    parent.add(this.owner);

    const cameraProps = {
      targetDefault: new THREE.Vector3(0, 1, 0),
      target: new THREE.Vector3(0, 1, 0),
      spherical: {
        theta: -0.5,
        phi: 0.3,
        radius: 10,
      },
    };
    this.cameraProps = cameraProps;
    this.newEntityProps = objectProps();

    this.oldMousePosition = { x: 0, y: 0 };
    this.camera.position.set(0, 0, cameraProps.radius);
    this.camera.lookAt(cameraProps.target);
    this.calculateCameraPosition();

    this.createRightMenu();
  }

  createRightMenu() {
    const { owner, engine } = this;
    const { parent } = owner;
    const convertObjectToArray = object => {
      const result = [];
      Object.keys(object).forEach(key => {
        result.push(object[key]);
      });
      return result;
    };
    // Create default UI
    setTimeout(() => {
      // Mode
      MenuAction.addMenuItem('mode', {
        id: 'dragMode',
        type: 'dropdown',
        label: 'Drag mode',
        object: this,
        property: 'dragMode',
        selectValues: ['Translate', 'Rotate', 'Scale'],
        onChange: (item, value) => {
          DraggableComponent.dragMode = value;
        },
      });
      MenuAction.addMenuItem('mode', {
        id: 'editMode',
        type: 'dropdown',
        label: 'Edit mode',
        object: this,
        property: 'editMode',
        selectValues: convertObjectToArray(EditMode),
        onChange: (item, value) => {
          this.handleChangeEditMode(value);
        },
      });
      MenuAction.addMenuItem('mode', {
        id: 'environmentMode',
        type: 'checkbox',
        label: 'Environment',
        object: this,
        property: 'isShowEnvironment',
        selectValues: ['Translate', 'Rotate', 'Scale'],
        onChange: () => {
          engine.renderer.shadowMap.enabled = this.isShowEnvironment;
          parent.getObjectByName('__skybox').visible = this.isShowEnvironment;
          parent.getObjectByName('__ground').visible = this.isShowEnvironment;
        },
      });
      MenuAction.addMenuItem('mode', {
        id: 'objectExportButton',
        type: 'button',
        label: 'Export scene',
        name: 'Download',
        color: 'secondary',
        onClick: () => {
          owner.addComponent('scene-export', new SceneExportComponent(engine));
        },
      });
      MenuAction.addMenuItem('mode', {
        id: 'objectImportButton',
        type: 'import',
        label: 'Import scene',
        name: 'Import',
        color: 'secondary',
        onClick: file => {
          owner.addComponent('scene-import', new SceneImportComponent(engine, file));
        },
      });
      // Camera
      MenuAction.addMenuItem('camera', {
        id: 'cameraViewMode',
        type: 'dropdown',
        label: 'Position',
        object: this,
        property: 'cameraViewMode',
        selectValues: ['Up', 'Down', 'Left', 'Right', 'Front', 'Back', 'Free'],
        onChange: () => {
          this.setCameraViewMode();
        },
      });
      MenuAction.addMenuItem('camera', {
        id: 'cameraMode',
        type: 'dropdown',
        label: 'View mode',
        object: this,
        property: 'cameraMode',
        selectValues: ['Perspective', 'Orthogonal'],
        onChange: (item, value) => {
          if (value === 'Perspective') {
            this.changeCameraPerspective();
          } else {
            this.changeCameraOrthogonal();
          }
        },
      });
      // Object
      MenuAction.addMenuItem('objectCreate', {
        id: 'objectCreate',
        type: 'dropdown',
        label: 'Object',
        object: this,
        property: 'createEntityType',
        selectValues: convertObjectToArray(EntityType),
        onChange: (item, value) => {
          MenuAction.removeMenuChilds('objectProperties');
          this.createObjectPropertiesMenu('objectProperties', value, this.newEntityProps);
        },
      });
      MenuAction.addMenuItem('objectCreate', {
        id: 'objectCreateButton',
        type: 'button',
        label: ' ',
        name: 'Create',
        color: 'secondary',
        onClick: () => {
          this.createNewEntity();
        },
      });
      MenuAction.addMenuItem('objectCreate', {
        id: 'objectProperties',
        type: 'anchor',
        defaultValue: true,
      });
      this.createObjectPropertiesMenu('objectProperties', EntityType.Cube, this.newEntityProps);
    });
  }

  /**
   * @anchor menu id these menus belong to
   * @entityType entityType
   * @newEntityProps newEntityProps
   * @changeCallback onChange callback
   */
  createObjectPropertiesMenu = (anchor, entityType, newEntityProps, changeCallback = () => {}) => {
    switch (entityType) {
      case EntityType.Cube:
        MenuAction.addMenuItem(anchor, {
          id: 'objectPropsWidthSegments',
          type: 'input',
          inputType: 'number',
          min: 1,
          max: 100,
          isRounded: true,
          label: 'Width segments',
          object: newEntityProps[entityType],
          property: 'widthSegments',
          onChange: changeCallback,
        });
        MenuAction.addMenuItem(anchor, {
          id: 'objectPropsHeightSegments',
          type: 'input',
          inputType: 'number',
          min: 1,
          max: 100,
          isRounded: true,
          label: 'Height segments',
          object: newEntityProps[entityType],
          property: 'heightSegments',
          onChange: changeCallback,
        });
        MenuAction.addMenuItem(anchor, {
          id: 'objectPropsDepthSegments',
          type: 'input',
          inputType: 'number',
          min: 1,
          max: 100,
          isRounded: true,
          label: 'Depth segments',
          object: newEntityProps[entityType],
          property: 'depthSegments',
          onChange: changeCallback,
        });
        break;
      case EntityType.Sphere:
        MenuAction.addMenuItem(anchor, {
          id: 'objectPropsWidthSegments',
          type: 'input',
          inputType: 'number',
          min: 3,
          max: 100,
          isRounded: true,
          label: 'Width segments',
          object: newEntityProps[entityType],
          property: 'widthSegments',
          onChange: changeCallback,
        });
        MenuAction.addMenuItem(anchor, {
          id: 'objectPropsHeightSegments',
          type: 'input',
          inputType: 'number',
          min: 3,
          max: 100,
          isRounded: true,
          label: 'Height segments',
          object: newEntityProps[entityType],
          property: 'heightSegments',
          onChange: changeCallback,
        });
        break;
      case EntityType.Cylinder:
        MenuAction.addMenuItem(anchor, {
          id: 'objectPropsRadialSegments',
          type: 'input',
          inputType: 'number',
          min: 3,
          max: 100,
          isRounded: true,
          label: 'Radial segments',
          object: newEntityProps[entityType],
          property: 'radialSegments',
          onChange: changeCallback,
        });
        MenuAction.addMenuItem(anchor, {
          id: 'objectPropsHeightSegments',
          type: 'input',
          inputType: 'number',
          min: 1,
          max: 100,
          isRounded: true,
          label: 'Height segments',
          object: newEntityProps[entityType],
          property: 'heightSegments',
          onChange: changeCallback,
        });
        break;
      case EntityType.Tube:
        MenuAction.addMenuItem(anchor, {
          id: 'objectPropsPath',
          type: 'input',
          inputType: 'number',
          min: 0.1,
          max: 100,
          step: 0.1,
          label: 'Path',
          object: newEntityProps[entityType],
          property: 'path',
          onChange: changeCallback,
        });
        MenuAction.addMenuItem(anchor, {
          id: 'objectPropsRadius',
          type: 'input',
          inputType: 'number',
          min: 0.1,
          max: 100,
          step: 0.1,
          label: 'Radius',
          object: newEntityProps[entityType],
          property: 'radius',
          onChange: changeCallback,
        });
        MenuAction.addMenuItem(anchor, {
          id: 'objectPropsTubularSegments',
          type: 'input',
          inputType: 'number',
          min: 1,
          max: 100,
          isRounded: true,
          label: 'Tubular segments',
          object: newEntityProps[entityType],
          property: 'tubularSegments',
          onChange: changeCallback,
        });
        MenuAction.addMenuItem(anchor, {
          id: 'objectPropsRadialSegments',
          type: 'input',
          inputType: 'number',
          min: 3,
          max: 100,
          isRounded: true,
          label: 'Radial segments',
          object: newEntityProps[entityType],
          property: 'radialSegments',
          onChange: changeCallback,
        });
        break;
      default:
        console.warn(`Unsupported Entity type: ${entityType}`);
        break;
    }
  };

  // Generate a new geometry for selected object with properties
  createGeometry = (entityType, props) => {
    switch (entityType) {
      case EntityType.CuttingPlane:
        return new THREE.PlaneGeometry(1, 1, 1);
      case EntityType.Plane:
        return new THREE.PlaneGeometry(1, 1, 1);
      case EntityType.Cube:
        return new THREE.BoxGeometry(1, 1, 1, props.widthSegments, props.heightSegments, props.depthSegments);
      case EntityType.Sphere:
        return new THREE.SphereGeometry(0.5, props.widthSegments, props.heightSegments);
      case EntityType.Torus:
        return new THREE.TorusGeometry(0.5, 0.2, 16, 16);
      case EntityType.Cylinder:
        return new THREE.CylinderGeometry(0.5, 0.5, 1, props.radialSegments, props.heightSegments);
      case EntityType.Tube: {
        const path = new CustomSinCurve(props.path);
        return new THREE.TubeGeometry(path, props.tubularSegments, props.radius, props.radialSegments);
      }
      case EntityType.Group:
        // Do nothing
        break;
      default:
        console.warn(`Unsupported Entity type: ${entityType}`);
        break;
    }
    return null;
  };

  createNewEntity = () => {
    const { owner, engine, newEntityProps } = this;
    const { parent } = owner;
    const selectedEntity = PickableComponent.pickedEntity;
    const addGenericInfo = e => {
      const entity = e;
      this.count += 1;
      entity.name += this.count;
      for (let i = 0; i < entity.children.length; i += 1) {
        entity.children[i].castShadow = true;
        entity.children[i].receiveShadow = false;
      }
      entity.position.copy(this.createPosition);
      entity.entityTypeProps = objectProps()[this.createEntityType];
      entity.addComponent('param', new ParameterComponent());
      entity.addComponent('draggable', new DraggableComponent(engine));
      entity.addComponent('param-ui', new ParameterUIComponent(engine));
      if (entity.entityType !== EntityType.Group) {
        entity.addComponent('edge', new EdgeComponent());
        entity.addComponent('pickable', new PickableComponent());
      }
      SceneComponent.isNeedUpdate = true;
      if (selectedEntity) {
        switch (selectedEntity.entityType) {
          case EntityType.Group:
            entity.setParentRetainPosition(selectedEntity);
            break;
          default:
            entity.setParentRetainPosition(selectedEntity.parent);
            break;
        }
      }
    };
    const selectFocusEntity = e => {
      this.selectEntity(e);
    };
    this.selectEntity(null);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 1,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const props = newEntityProps[this.createEntityType];
    const geometry = this.createGeometry(this.createEntityType, props);
    switch (this.createEntityType) {
      case EntityType.CuttingPlane: {
        geometry.computeFaceNormals();
        const entity = new Entity(parent, [geometry], [material]);
        entity.name = this.createEntityType;
        entity.entityType = this.createEntityType;
        entity.scale.set(10, 10, 10);
        entity.children[0].material.opacity = 0.5;
        addGenericInfo(entity);
        selectFocusEntity(entity);
        break;
      }
      case EntityType.Plane: {
        geometry.computeFaceNormals();
        const entity = new Entity(parent, [geometry], [material]);
        entity.name = this.createEntityType;
        entity.entityType = this.createEntityType;
        addGenericInfo(entity);
        selectFocusEntity(entity);
        break;
      }
      case EntityType.Cube: {
        const entity = new Entity(parent, [geometry], [material]);
        entity.name = this.createEntityType;
        entity.entityType = this.createEntityType;
        addGenericInfo(entity);
        selectFocusEntity(entity);
        break;
      }
      case EntityType.Sphere: {
        const entity = new Entity(parent, [geometry], [material]);
        entity.name = this.createEntityType;
        entity.entityType = this.createEntityType;
        addGenericInfo(entity);
        selectFocusEntity(entity);
        break;
      }
      case EntityType.Torus: {
        const entity = new Entity(parent, [geometry], [material]);
        entity.name = this.createEntityType;
        entity.entityType = this.createEntityType;
        addGenericInfo(entity);
        selectFocusEntity(entity);
        break;
      }
      case EntityType.Cylinder: {
        const entity = new Entity(parent, [geometry], [material]);
        entity.name = this.createEntityType;
        entity.entityType = this.createEntityType;
        addGenericInfo(entity);
        selectFocusEntity(entity);
        break;
      }
      case EntityType.Tube: {
        const entity = new Entity(parent, [geometry], [material]);
        entity.name = this.createEntityType;
        entity.entityType = this.createEntityType;
        addGenericInfo(entity);
        selectFocusEntity(entity);
        break;
      }
      case EntityType.Group: {
        const entity = new Entity(parent, [], []);
        entity.name = this.createEntityType;
        entity.entityType = this.createEntityType;
        addGenericInfo(entity);
        selectFocusEntity(entity);
        break;
      }
      default:
        console.warn(`Unsupported Entity type: ${this.createEntityType}`);
        break;
    }
  };

  initCamera = () => {
    const { engine } = this;
    // Create perspective camera
    const perspectiveCamera = new THREE.PerspectiveCamera(45, engine.width / engine.height, 0.1, 1000);
    const fov = 45;
    const depth = Math.tan(((fov / 2.0) * Math.PI) / 180.0) * 2.0;
    const aspect = engine.width / engine.height;
    const Z = 10;
    const sizeY = depth * Z;
    const sizeX = sizeY * aspect;
    this.perspectiveCamera = perspectiveCamera;
    // Create othogonal camera
    const orthogonalCamera = new THREE.OrthographicCamera(sizeX / -2, sizeX / 2, sizeY / 2, sizeY / -2, -1000, 1000);
    this.orthogonalCamera = orthogonalCamera;
    // Set default camera = perspective
    this.camera = perspectiveCamera;
  };

  setCameraViewMode = () => {
    const oldCamera = {
      target: {
        x: this.cameraProps.target.x,
        y: this.cameraProps.target.y,
        z: this.cameraProps.target.z,
      },
      spherical: {
        radius: this.cameraProps.spherical.radius,
        phi: this.cameraProps.spherical.phi,
        theta: this.cameraProps.spherical.theta,
      },
    };
    let newCamera = {};
    switch (this.cameraViewMode) {
      case 'Up':
        newCamera = {
          target: this.cameraProps.targetDefault.clone(),
          spherical: {
            theta: 0,
            phi: Math.PI / 2,
            radius: 15,
          },
        };
        break;
      case 'Down':
        newCamera = {
          target: this.cameraProps.targetDefault.clone(),
          spherical: {
            theta: 0,
            phi: -Math.PI / 2,
            radius: 15,
          },
        };
        break;
      case 'Front':
        newCamera = {
          target: this.cameraProps.targetDefault.clone(),
          spherical: {
            theta: 0,
            phi: 0,
            radius: 15,
          },
        };
        break;
      case 'Back':
        newCamera = {
          target: this.cameraProps.targetDefault.clone(),
          spherical: {
            theta: Math.PI,
            phi: 0,
            radius: 15,
          },
        };
        break;
      case 'Left':
        newCamera = {
          target: this.cameraProps.targetDefault.clone(),
          spherical: {
            theta: -Math.PI / 2,
            phi: 0,
            radius: 15,
          },
        };
        break;
      case 'Right':
        newCamera = {
          target: this.cameraProps.targetDefault.clone(),
          spherical: {
            theta: Math.PI / 2,
            phi: 0,
            radius: 15,
          },
        };
        break;
      default:
        newCamera = {
          target: this.cameraProps.targetDefault.clone(),
          spherical: {
            theta: -0.5,
            phi: 0.3,
            radius: 10,
          },
        };
        break;
    }
    let step = 0;
    const interval = setInterval(() => {
      step += 0.025;
      if (step > 1) {
        step = 1;
        clearInterval(interval);
      }
      this.cameraProps.target.set(
        Utils.clerp(oldCamera.target.x, newCamera.target.x, step),
        Utils.clerp(oldCamera.target.y, newCamera.target.y, step),
        Utils.clerp(oldCamera.target.z, newCamera.target.z, step)
      );
      // this.cameraProps.spherical.radius = Utils.clerp(oldCamera.spherical.radius, newCamera.spherical.radius, step);
      this.cameraProps.spherical.phi = Utils.clerp(oldCamera.spherical.phi, newCamera.spherical.phi, step);
      this.cameraProps.spherical.theta = Utils.clerp(oldCamera.spherical.theta, newCamera.spherical.theta, step);
      this.calculateCameraPosition();
    }, Math.round(1000 / 60));
  };

  changeCameraPerspective = () => {
    this.cameraMode = 'Perspective';
    this.perspectiveCamera.position.copy(this.camera.position);
    this.perspectiveCamera.quaternion.copy(this.camera.quaternion);
    this.camera = this.perspectiveCamera;
  };

  changeCameraOrthogonal = () => {
    this.cameraMode = 'Orthogonal';
    this.orthogonalCamera.position.copy(this.camera.position);
    this.orthogonalCamera.quaternion.copy(this.camera.quaternion);
    this.camera = this.orthogonalCamera;
  };

  calculateCameraPosition = () => {
    const { cameraProps } = this;
    const { spherical, target } = cameraProps;
    const { position } = this.camera;
    position.copy(Utils.sphericalToCartesdian(spherical.radius, spherical.theta, spherical.phi));
    position.add(target);
    this.camera.lookAt(target);
    this.camera.updateMatrix();
  };

  getEntiy(object) {
    if (object && object.parent && object.type !== 'Object3D') {
      return this.getEntiy(object.parent);
    }
    return object;
  }

  /**
   * Focus camera on entity
   */
  focusEntity(entity) {
    const { camera } = this;
    const v = new THREE.Vector3();
    PickableComponent.pickedEntity.getWorldPosition(v);
    entity.addComponent('focus', new FocusComponent(camera, this.cameraProps.target.clone(), v, this.cameraProps));
  }

  /**
   * Set this entity as selected
   */
  selectEntity(object) {
    const { engine } = this;
    if (PickableComponent.pickedEntity) {
      // Restore old color ...
      const oldEntity = PickableComponent.pickedEntity;
      oldEntity.removeComponent('colorize');
    }
    const entity = this.getEntiy(object);
    PickableComponent.pickedEntity = entity;
    if (entity) {
      entity.addComponent('colorize', new ColorizeComponent(engine));
    }
  }

  /**
   * Return true if the entity is already selected before
   * @param isSetNew true if we want to select a new entity
   */
  checkSelectedEntity(isSetNew) {
    const { camera, engine } = this;
    const mouse = new THREE.Vector2(
      (engine.inputMouse.x / engine.width) * 2 - 1,
      (1 - engine.inputMouse.y / engine.height) * 2 - 1
    );
    const ray = new THREE.Raycaster();
    ray.linePrecision = 0.15;
    ray.setFromCamera(mouse, camera);
    let entities = PickableComponent.pickableEntities;
    if (!isSetNew) {
      // Only object is selectable, Group is not
      if (PickableComponent.pickedEntity && PickableComponent.pickedEntity.entityType !== EntityType.Group) {
        entities = [PickableComponent.pickedEntity];
      } else {
        entities = [];
      }
    }
    // Check against axis
    EdgeComponent.detachEdges();
    const axisIntersects = ray.intersectObjects([DraggableComponent.axis], true);
    // Check against pickable objects
    const intersects = ray.intersectObjects(entities, true);
    EdgeComponent.attachEdges();
    let checked = false;
    if (intersects.length > 0 || axisIntersects.length > 0) {
      checked = PickableComponent.pickedEntity !== null;
      if (isSetNew) {
        if (axisIntersects.length === 0) {
          this.selectEntity(intersects[0].object);
        }
      }
      if (axisIntersects.length !== 0) {
        // Set current selected axis
        DraggableComponent.currentAxis = axisIntersects[0].object.name;
      } else {
        DraggableComponent.currentAxis = null;
      }
    } else if (isSetNew) {
      this.selectEntity(null);
    }
    return checked;
  }

  handleMoveCamera() {
    const { camera, engine, oldMousePosition, cameraProps } = this;
    const { target, spherical } = cameraProps;
    // Rotate/move camera
    this.isMouseMove = true;
    if (engine.inputMouse.left) {
      spherical.theta += Utils.degToRad((oldMousePosition.x - engine.inputMouse.x) * 0.5);
      spherical.phi = Utils.clamp(
        spherical.phi - Utils.degToRad((oldMousePosition.y - engine.inputMouse.y) * 0.5),
        Utils.degToRad(89.9999),
        Utils.degToRad(-89.9999)
      );
      this.calculateCameraPosition();
      this.cameraViewMode = 'Free';
    }
    if (engine.inputMouse.middle) {
      const deltaX = (oldMousePosition.x - engine.inputMouse.x) * 0.01;
      const deltaY = (oldMousePosition.y - engine.inputMouse.y) * 0.01;
      const directionVector = new THREE.Vector3().subVectors(target, camera.position).normalize();
      const leftVector = new THREE.Vector3().crossVectors(camera.up, directionVector).normalize();
      const upVector = new THREE.Vector3().crossVectors(directionVector, leftVector).normalize();
      target.add(leftVector.multiplyScalar(-deltaX));
      target.add(upVector.multiplyScalar(-deltaY));
      this.calculateCameraPosition();
      this.cameraViewMode = 'Free';
      this.cameraProps.targetDefault.copy(this.cameraProps.target);
    }
  }

  handleZoomCamera() {
    const { engine, cameraProps } = this;
    const { spherical } = cameraProps;
    // Camera zoom in/zoom out
    if (this.cameraMode === 'Perspective') {
      spherical.radius = Utils.max(0.0001, spherical.radius + engine.inputMouse.wheelDelta * 1.25);
    } else {
      const d = -engine.inputMouse.wheelDelta * 0.05;
      const s = new THREE.Vector3(d, d, d);
      this.camera.scale.sub(s);
    }
    this.calculateCameraPosition();
    engine.inputMouse.type = '';
  }

  handleChangeEditMode(editMode) {
    this.editMode = editMode;
    const selectedEntity = PickableComponent.pickedEntity;
    if (selectedEntity) {
      selectedEntity.isNeedUpdate = true;
    }
    this.dragMode = 'Translate';
    MenuAction.refresh();
  }

  handleEditObjectMode() {
    const { engine } = this;
    // No dragging state handle
    if (!this.isDragging) {
      switch (engine.inputMouse.type) {
        case 'mousedown':
          this.isMouseMove = false;
          // We enter dragging state if we already select an entity before
          if (engine.inputMouse.left && this.checkSelectedEntity(false)) {
            const selectedEntity = PickableComponent.pickedEntity;
            // Dragging object in Object mode?
            if (selectedEntity) {
              const draggableComponent = selectedEntity.findComponent('draggable');
              if (draggableComponent) {
                draggableComponent.isDragging = true;
              }
              this.isDragging = true;
            }
          }
          break;
        case 'mousemove':
          this.handleMoveCamera();
          break;
        case 'wheel':
          this.handleZoomCamera();
          break;
        default:
          break;
      }
    }
    // If we havent selected any entities, and the left mosue is release, then we will check to see if the mouse hit any entities
    if (
      !this.isDragging &&
      !this.isMouseMove &&
      engine.inputMouse.type === 'mouseup' &&
      engine.inputMouse.which === 1
    ) {
      this.checkSelectedEntity(true);
      engine.inputMouse.type = '';
    }
    // Release mouse also mean we disable dragging state for both controller and the selected entity
    if (engine.inputMouse.type === 'mouseup' || engine.inputMouse.type === '') {
      // For Object mode
      const selectedEntity = PickableComponent.pickedEntity;
      if (selectedEntity) {
        const draggableComponent = selectedEntity.findComponent('draggable');
        if (draggableComponent) {
          draggableComponent.isDragging = false;
        }
      }
      this.isDragging = false;
      DraggableComponent.currentAxis = null;
      engine.inputMouse.type = '';
    }
    // Focus on entities when double click
    if (engine.inputMouse.type === 'mousedoubledown' && engine.inputMouse.which === 1 && !this.isMouseMove) {
      const selectedEntity = PickableComponent.pickedEntity;
      // Move camera to focus on new entity goes here (for object mode)
      if (selectedEntity) {
        this.focusEntity(selectedEntity);
      }
    }
  }

  handleEditVertexMode() {
    const { engine } = this;
    // No dragging state handle
    if (!this.isDragging) {
      switch (engine.inputMouse.type) {
        case 'mousedown':
          this.isMouseMove = false;
          // We enter dragging state if we already select an entity before
          if (engine.inputMouse.left && this.checkSelectedEntity(false)) {
            const selectedEntity = PickableComponent.pickedEntity;
            // Dragging object in Vertex mode?
            if (selectedEntity) {
              selectedEntity.addComponent('pickable-vertex', new PickableVertexComponent(engine));
              const draggableComponent = selectedEntity.findComponent('draggable');
              if (draggableComponent) {
                draggableComponent.isDragging = true;
              }
              this.isDragging = true;
            }
          }
          break;
        case 'mousemove':
          this.handleMoveCamera();
          break;
        case 'wheel':
          this.handleZoomCamera();
          break;
        default:
          break;
      }
    }
    // If we havent selected any entities, and the left mosue is release, then we will check to see if the mouse hit any entities
    if (
      !this.isDragging &&
      !this.isMouseMove &&
      engine.inputMouse.type === 'mouseup' &&
      engine.inputMouse.which === 1
    ) {
      const selectedEntity = PickableComponent.pickedEntity;
      if (!selectedEntity) {
        this.checkSelectedEntity(true);
      }
      engine.inputMouse.type = '';
    }
    // Release mouse also mean we disable dragging state for both controller and the selected entity
    if (engine.inputMouse.type === 'mouseup' || engine.inputMouse.type === '') {
      // For Vertex mode
      const selectedEntity = PickableComponent.pickedEntity;
      if (selectedEntity) {
        const draggableComponent = selectedEntity.findComponent('draggable');
        if (draggableComponent) {
          draggableComponent.isDragging = false;
        }
      }
      this.isDragging = false;
      DraggableComponent.currentAxis = null;
      engine.inputMouse.type = '';
    }
  }

  handleKeys() {
    const { engine } = this;
    const { keys } = engine.inputKeys;
    if (keys.Shift) {
      if (keys.V) {
        this.handleChangeEditMode(EditMode.Vertex);
        keys.V = false;
      } else if (keys.O) {
        this.handleChangeEditMode(EditMode.Object);
        keys.O = false;
      }
    }
  }

  showContextMenu = () => {
    const { engine, owner } = this;
    const { parent } = owner;
    const selectedEntity = PickableComponent.pickedEntity;
    if (!selectedEntity) {
      return;
    }
    // Generate group menu by searching through child items
    const children = [];
    if (parent !== selectedEntity.parent) {
      children.push({
        type: 'item',
        name: 'Remove Group By',
        onClick: () => {
          selectedEntity.setParentRetainPosition(parent);
          SceneComponent.isNeedUpdate = true;
        },
      });
      children.push({ type: 'divider' });
    }
    parent.traverse(entity => {
      if (entity.entityType === EntityType.Group && entity !== selectedEntity) {
        children.push({
          type: 'item',
          name: entity.name,
          onClick: () => {
            // TODO: Sync child position to suit with the change
            selectedEntity.setParentRetainPosition(entity);
            SceneComponent.isNeedUpdate = true;
          },
        });
      }
    });
    const menu = [];
    if (this.editMode === EditMode.Object) {
      menu.push({
        type: 'subMenu',
        name: 'Group By',
        children,
      });
      menu.push({
        type: 'item',
        name: 'Clone',
        onClick: () => {
          selectedEntity.addComponent('clone', new CloneComponent(engine));
        },
      });
    }
    if (this.editMode === EditMode.Vertex) {
      menu.push({
        type: 'item',
        name: 'Unselect vertices',
        onClick: () => {
          for (let i = 0; i < selectedEntity.paramSelectedVertices.length; i += 1) {
            const child = selectedEntity.paramSelectedVertices[i];
            child.children[0].material.color.setHex(0x00b000);
          }
          selectedEntity.paramSelectedVertices = [];
        },
      });
    }
    menu.push({ type: 'divider' });
    menu.push({
      type: 'item',
      name: 'Delete',
      onClick: () => {
        const uiParamComponent = selectedEntity.findComponent('param-ui');
        uiParamComponent.deleteEntity();
      },
    });

    ContextMenuAction.create(menu);
    ContextMenuAction.position(engine.inputMouse.screenX, engine.inputMouse.screenY);
    ContextMenuAction.show();
  };

  handleContextMenu = () => {
    const { engine } = this;
    if (engine.inputMouse.type === 'mouseup' && engine.inputMouse.which === 3) {
      this.showContextMenu();
    }
  };

  update(delta) {
    super.update(delta);
    const { camera, owner, engine, oldMousePosition, editMode } = this;
    // Context menu handling goes here
    this.handleContextMenu();
    switch (editMode) {
      case EditMode.Object:
        this.handleEditObjectMode();
        break;
      case EditMode.Vertex:
        this.handleEditVertexMode();
        break;
      default:
        break;
    }
    //
    this.handleKeys();
    //
    oldMousePosition.x = engine.inputMouse.x;
    oldMousePosition.y = engine.inputMouse.y;
    // Update UI
    const { position } = camera;
    owner.position.set(position.x, position.y, position.z);
  }
}

export default ControllerComponent;
export { EntityType };
