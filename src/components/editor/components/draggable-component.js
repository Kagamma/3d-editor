import * as THREE from 'three';
import BaseComponent from './base-component';
import PickableComponent from './pickable-component';
import * as MenuAction from '../../left-menu/actions';

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(5000, 5000),
  new THREE.MeshLambertMaterial({
    alphaTest: 0,
    visible: false,
    color: 0x000080,
    side: THREE.DoubleSide,
  })
);
plane.name = '_draggablePlane';

const geomX = new THREE.Geometry();
geomX.vertices.push(new THREE.Vector3(0, 0, 0));
geomX.vertices.push(new THREE.Vector3(1.5, 0, 0));
const axisX = new THREE.LineSegments(geomX, new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 4 }));
const geomY = new THREE.Geometry();
geomY.vertices.push(new THREE.Vector3(0, 0, 0));
geomY.vertices.push(new THREE.Vector3(0, 1.5, 0));
const axisY = new THREE.LineSegments(geomY, new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 4 }));
const geomZ = new THREE.Geometry();
geomZ.vertices.push(new THREE.Vector3(0, 0, 0));
geomZ.vertices.push(new THREE.Vector3(0, 0, 1.5));
const axisZ = new THREE.LineSegments(geomZ, new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 4 }));
axisX.name = 'x';
axisY.name = 'y';
axisZ.name = 'z';
const axis = new THREE.Object3D();
axis.add(axisX);
axis.add(axisY);
axis.add(axisZ);
axis.name = '_draggableAxis';

class DraggableComponent extends BaseComponent {
  static axis = axis;

  static currentAxis = null;

  static dragMode = 'Translate';

  constructor(engine) {
    super();
    this.engine = engine;
    this.controller = engine.controller;
    this.controllerComponent = engine.controller.findComponent('controller');
    this.isDragging = false;
    this.isDragging = false;
    this.startingPoint = new THREE.Vector3();
    this.count = 0;
  }

  start() {
    const { engine } = this.controller.findComponent('controller');
    const { noDepthScene } = engine;
    if (!engine.scene.getObjectByName(plane.name)) {
      engine.scene.add(plane);
    }
    if (!noDepthScene.getObjectByName(axis.name)) {
      noDepthScene.add(axis);
    }
  }

  handleDragVertexPosition() {
    const { owner, controllerComponent, startingPoint } = this;
    const { camera, engine } = controllerComponent;
    const { currentAxis } = DraggableComponent;
    if (this.isDragging && currentAxis) {
      // Find intersection point between panel and mouse ray
      const mouse = new THREE.Vector2(
        (engine.inputMouse.x / engine.width) * 2 - 1,
        (1 - engine.inputMouse.y / engine.height) * 2 - 1
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);
      const intersects = ray.intersectObjects([plane], true);
      if (intersects.length > 0) {
        // TODO: Need a better way to detect first-time select
        if (startingPoint.x === 0 && startingPoint.y === 0 && startingPoint.z === 0) {
          this.count = 0;
        }
        if (this.count < 2) {
          startingPoint.copy(intersects[0].point);
          return;
        }
        // Calculate the vector from new position to old position
        const dirVector = new THREE.Vector3().subVectors(intersects[0].point, startingPoint);
        // Update owner position to intersect coordinate
        switch (currentAxis) {
          case 'x':
            dirVector.y = 0;
            dirVector.z = 0;
            break;
          case 'y':
            dirVector.x = 0;
            dirVector.z = 0;
            break;
          case 'z':
            dirVector.x = 0;
            dirVector.y = 0;
            break;
          default:
            break;
        }
        //
        owner.updateMatrixWorld();
        const m = new THREE.Matrix3().setFromMatrix4(owner.matrixWorld);
        m.getInverse(m);
        dirVector.applyMatrix3(m);
        //
        for (let i = 0; i < owner.paramSelectedVertices.length; i += 1) {
          const child = owner.paramSelectedVertices[i];
          child.position.add(dirVector);
          child.position.set(
            parseFloat(parseFloat(child.position.x).toFixed(2)),
            parseFloat(parseFloat(child.position.y).toFixed(2)),
            parseFloat(parseFloat(child.position.z).toFixed(2))
          );
          child.paramVertexOwner.add(dirVector);
          child.paramVertexOwner.set(
            parseFloat(parseFloat(child.paramVertexOwner.x).toFixed(2)),
            parseFloat(parseFloat(child.paramVertexOwner.y).toFixed(2)),
            parseFloat(parseFloat(child.paramVertexOwner.z).toFixed(2))
          );
        }
        owner.children[0].geometry.verticesNeedUpdate = true;
        // Store the new position as old
        startingPoint.copy(intersects[0].point);
      }
    }
  }

  handleDragPosition() {
    const { owner, controllerComponent, startingPoint } = this;
    const { camera, engine } = controllerComponent;
    const { currentAxis } = DraggableComponent;
    if (this.isDragging) {
      // Find intersection point between panel and mouse ray
      const mouse = new THREE.Vector2(
        (engine.inputMouse.x / engine.width) * 2 - 1,
        (1 - engine.inputMouse.y / engine.height) * 2 - 1
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);
      const intersects = ray.intersectObjects([plane], true);
      if (intersects.length > 0) {
        // TODO: Need a better way to detect first-time select
        if (startingPoint.x === 0 && startingPoint.y === 0 && startingPoint.z === 0) {
          this.count = 0;
        }
        if (this.count < 2) {
          startingPoint.copy(intersects[0].point);
          return;
        }
        // Calculate the vector from new position to old position
        const dirVector = new THREE.Vector3().subVectors(intersects[0].point, startingPoint);
        // Update owner position to intersect coordinate
        switch (currentAxis) {
          case 'x':
            dirVector.y = 0;
            dirVector.z = 0;
            break;
          case 'y':
            dirVector.x = 0;
            dirVector.z = 0;
            break;
          case 'z':
            dirVector.x = 0;
            dirVector.y = 0;
            break;
          default:
            break;
        }
        //
        owner.updateMatrixWorld();
        const m = new THREE.Matrix3().setFromMatrix4(owner.parent.matrixWorld);
        m.getInverse(m);
        dirVector.applyMatrix3(m);
        //
        owner.position.add(dirVector);
        owner.position.set(
          parseFloat(parseFloat(owner.position.x).toFixed(2)),
          parseFloat(parseFloat(owner.position.y).toFixed(2)),
          parseFloat(parseFloat(owner.position.z).toFixed(2))
        );
        // Store the new position as old
        startingPoint.copy(intersects[0].point);
      }
    }
  }

  handleScalePosition() {
    const { owner, controller, startingPoint } = this;
    const { camera, engine } = controller.findComponent('controller');
    const { currentAxis } = DraggableComponent;
    if (this.isDragging) {
      // Find intersection point between panel and mouse ray
      const mouse = new THREE.Vector2(
        (engine.inputMouse.x / engine.width) * 2 - 1,
        (1 - engine.inputMouse.y / engine.height) * 2 - 1
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);
      const intersects = ray.intersectObjects([plane], true);
      if (intersects.length > 0) {
        // TODO: Need a better way to detect first-time select
        if (startingPoint.x === 0 && startingPoint.y === 0 && startingPoint.z === 0) {
          this.count = 0;
        }
        if (this.count < 2) {
          startingPoint.copy(intersects[0].point);
          return;
        }
        // Calculate the vector from new position to old position
        const dirVector = new THREE.Vector3().subVectors(intersects[0].point, startingPoint);
        // Update owner position to intersect coordinate
        switch (currentAxis) {
          case 'x':
            dirVector.y = 0;
            dirVector.z = 0;
            break;
          case 'y':
            dirVector.x = 0;
            dirVector.z = 0;
            break;
          case 'z':
            dirVector.x = 0;
            dirVector.y = 0;
            break;
          default: {
            const norm = (dirVector.x + dirVector.y + dirVector.z) / 3;
            dirVector.x = norm;
            dirVector.y = norm;
            dirVector.z = norm;
            break;
          }
        }
        owner.scale.add(dirVector);
        owner.scale.set(
          parseFloat(parseFloat(owner.scale.x).toFixed(2)),
          parseFloat(parseFloat(owner.scale.y).toFixed(2)),
          parseFloat(parseFloat(owner.scale.z).toFixed(2))
        );
        // Store the new position as old
        startingPoint.copy(intersects[0].point);
      }
    }
  }

  handleRotatePosition() {
    const { owner, controller, startingPoint } = this;
    const { camera, engine } = controller.findComponent('controller');
    const { currentAxis } = DraggableComponent;
    if (this.isDragging) {
      // Find intersection point between panel and mouse ray
      const mouse = new THREE.Vector2(
        (engine.inputMouse.x / engine.width) * 2 - 1,
        (1 - engine.inputMouse.y / engine.height) * 2 - 1
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);
      const intersects = ray.intersectObjects([plane], true);
      if (intersects.length > 0) {
        // TODO: Need a better way to detect first-time select
        if (startingPoint.x === 0 && startingPoint.y === 0 && startingPoint.z === 0) {
          this.count = 0;
        }
        if (this.count < 2) {
          startingPoint.copy(intersects[0].point);
          return;
        }
        // Calculate the vector from new position to old position
        const dirVector = new THREE.Vector3().subVectors(intersects[0].point, startingPoint);
        // Update owner position to intersect coordinate
        switch (currentAxis) {
          case 'x':
            dirVector.y = 0;
            dirVector.z = 0;
            break;
          case 'y':
            dirVector.y = dirVector.x;
            dirVector.x = 0;
            dirVector.z = 0;
            break;
          case 'z':
            dirVector.z = dirVector.x;
            dirVector.x = 0;
            dirVector.y = 0;
            break;
          default:
            dirVector.x = 0;
            dirVector.y = 0;
            dirVector.z = 0;
            break;
        }
        owner.paramRotation.add(dirVector.multiplyScalar(50));
        owner.paramRotation.set(
          parseFloat(parseFloat(owner.paramRotation.x).toFixed(2)),
          parseFloat(parseFloat(owner.paramRotation.y).toFixed(2)),
          parseFloat(parseFloat(owner.paramRotation.z).toFixed(2))
        );
        // Store the new position as old
        startingPoint.copy(intersects[0].point);
      }
    }
  }

  updatePlaneOrient = () => {
    const { controller } = this;
    const { camera } = controller.findComponent('controller');
    const { currentAxis } = DraggableComponent;
    plane.quaternion.copy(camera.quaternion);
    if (DraggableComponent.dragMode === 'Translate') {
      const q = new THREE.Quaternion();
      switch (currentAxis) {
        case 'x':
          axis.getWorldQuaternion(q);
          plane.quaternion.copy(q);
          plane.rotation.x = camera.rotation.x;
          plane.rotation.z = camera.rotation.z;
          break;
        case 'y':
          axis.getWorldQuaternion(q);
          plane.quaternion.copy(q);
          plane.rotation.y = camera.rotation.y;
          break;
        case 'z':
          axis.getWorldQuaternion(q);
          plane.quaternion.copy(q);
          plane.rotation.y -= Math.PI / 2;
          plane.rotation.x = camera.rotation.x;
          plane.rotation.z = camera.rotation.z;
          break;
        default:
          break;
      }
    }
  };

  update(delta) {
    super.update(delta);
    const { owner, controllerComponent } = this;
    const { cameraProps, cameraMode } = controllerComponent;
    const { currentAxis } = DraggableComponent;
    const entity = PickableComponent.pickedEntity;
    // Move movable panel & axis here
    if (owner === entity) {
      const v = new THREE.Vector3();
      owner.getWorldPosition(v);
      plane.position.copy(v);
      this.updatePlaneOrient();
      switch (currentAxis) {
        case 'x':
          axisX.visible = true;
          axisY.visible = false;
          axisZ.visible = false;
          break;
        case 'y':
          axisX.visible = false;
          axisY.visible = true;
          axisZ.visible = false;
          break;
        case 'z':
          axisX.visible = false;
          axisY.visible = false;
          axisZ.visible = true;
          break;
        default:
          axisX.visible = true;
          axisY.visible = true;
          axisZ.visible = true;
          break;
      }
    }
    //
    if (owner === entity) {
      if (controllerComponent.editMode === 'Object') {
        // For dragging
        switch (DraggableComponent.dragMode) {
          case 'Translate':
            this.handleDragPosition();
            break;
          case 'Rotate':
            this.handleRotatePosition();
            break;
          case 'Scale':
            this.handleScalePosition();
            break;
          default:
            break;
        }
      }
      if (controllerComponent.editMode === 'Vertex') {
        // For dragging
        switch (DraggableComponent.dragMode) {
          case 'Translate':
            this.handleDragVertexPosition();
            break;
          default:
            break;
        }
      }
    }
    //
    if (entity) {
      axis.visible = true;
      const s = cameraMode === 'Perspective' ? cameraProps.spherical.radius * 0.1 : 1;
      axis.scale.set(s, s, s);
      const v = new THREE.Vector3();
      const q = new THREE.Quaternion();
      entity.getWorldPosition(v);
      entity.getWorldQuaternion(q);
      if (DraggableComponent.dragMode !== 'Translate') {
        axis.quaternion.copy(q);
      } else {
        axis.rotation.set(0, 0, 0);
      }
      // Manually call colorize component update() to update position of wireframe
      const colorizeComponent = entity.findComponent('colorize');
      if (colorizeComponent) {
        colorizeComponent.update();
      }
      // If this object has selected vertices, we focus on the last vertex instead ...
      if (entity.paramSelectedVertices.length > 0) {
        entity.paramSelectedVertices[entity.paramSelectedVertices.length - 1].getWorldPosition(v);
      }
      axis.position.copy(v);
    } else {
      axis.visible = false;
    }
    if (!this.isDragging) {
      this.startingPoint.set(0, 0, 0);
    } else if (this.isDragging) {
      // TODO: This is an expensive operation. We are trying to redraw the entire menu everytime we drag the object
      MenuAction.refresh();
    }
    this.count += 1;
  }
}

export default DraggableComponent;
