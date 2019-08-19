import * as THREE from 'three';
import BaseComponent from './base-component';
import Entity from '../core/entity';
import EdgeComponent from './edge-component';

const geomX = new THREE.Geometry();
geomX.vertices.push(new THREE.Vector3(-500, 0, 0));
geomX.vertices.push(new THREE.Vector3(500, 0, 0));
const axisX = new THREE.LineSegments(geomX, new THREE.LineBasicMaterial({ color: 0x800000, linewidth: 2 }));
const geomY = new THREE.Geometry();
geomY.vertices.push(new THREE.Vector3(0, -500, 0));
geomY.vertices.push(new THREE.Vector3(0, 500, 0));
const axisY = new THREE.LineSegments(geomY, new THREE.LineBasicMaterial({ color: 0x008000, linewidth: 2 }));
const geomZ = new THREE.Geometry();
geomZ.vertices.push(new THREE.Vector3(0, 0, -500));
geomZ.vertices.push(new THREE.Vector3(0, 0, 500));
const axisZ = new THREE.LineSegments(geomZ, new THREE.LineBasicMaterial({ color: 0x000080, linewidth: 2 }));
const quad = new THREE.BufferGeometry(0.06, 0.06);
quad.addAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
const quadMaterial = new THREE.PointsMaterial({ color: 0x00b000, size: 6, sizeAttenuation: false });

class ColorizeComponent extends BaseComponent {
  constructor(engine) {
    super();
    this.engine = engine;
    this.controller = engine.controller;
    this.controllerComponent = engine.controller.findComponent('controller');
  }

  start() {
    super.start();
    const { owner } = this;

    this.generateHighlightElements();
    owner.isSelected = true;
  }

  generateHighlightElements() {
    const { owner, engine, controllerComponent } = this;
    // Create root line
    const lineEntity = new Entity(engine.noDepthScene);
    this.lineEntity = lineEntity;
    const geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3());
    geom.vertices.push(new THREE.Vector3(0, 1, 0));
    const lines = new THREE.Line(
      geom,
      new THREE.LineDashedMaterial({ color: 0xffa500, dashSize: 0.03, gapSize: 0.015 })
    );
    lines.computeLineDistances();
    lineEntity.add(lines);
    // create root axis
    const axisEntity = new Entity(owner.parent);
    this.axisEntity = axisEntity;
    axisEntity.add(axisX);
    axisEntity.add(axisY);
    axisEntity.add(axisZ);
    // Group cannot highlight...
    if (owner.entityType === 'Group') {
      return;
    }
    owner.addComponent('edge', new EdgeComponent(true));
    // Highlight edge
    const edgeEntity = new Entity(engine.scene);
    this.edgeEntity = edgeEntity;
    edgeEntity.scale.set(0, 0, 0);
    switch (controllerComponent.editMode) {
      case 'Object': {
        const lineSegs = new THREE.LineSegments(
          owner.children[1].geometry.clone(),
          new THREE.LineBasicMaterial({ color: 0xffa500 })
        );
        lineSegs.position.copy(owner.children[0].position);
        edgeEntity.add(lineSegs);
        break;
      }
      case 'Vertex': {
        const lineSegs = new THREE.Mesh(
          owner.children[0].geometry,
          new THREE.MeshBasicMaterial({ color: 0xffa500, wireframe: true })
        );
        lineSegs.position.copy(owner.children[0].position);
        edgeEntity.add(lineSegs);
        break;
      }
      default:
        break;
    }
    // Highlight vertices
    // We will use these quads to detect which vertex we are selecting
    const vertexHighlightGroup = new Entity(engine.scene);
    this.vertexHighlightGroup = vertexHighlightGroup;
    owner.paramVertexGroup = vertexHighlightGroup;
    owner.paramSelectedVertices = [];
    vertexHighlightGroup.matrixAutoUpdate = false;
    const { vertices } = owner.children[0].geometry;
    for (let i = 0; i < vertices.length; i += 1) {
      const vertex = vertices[i];
      const vertexEntity = new Entity(vertexHighlightGroup);
      const points = new THREE.Points(quad.clone(), quadMaterial.clone());
      vertexEntity.add(points);
      vertexEntity.position.copy(vertex);
      vertexEntity.paramVertexOwner = vertex;
      vertexEntity.entityType = 'Vertex';
    }
    owner.updateMatrixWorld();
    vertexHighlightGroup.matrix.copy(owner.matrixWorld);
  }

  update() {
    super.update();
    const { owner, edgeEntity, lineEntity, axisEntity, vertexHighlightGroup, controllerComponent } = this;

    const v = new THREE.Vector3();
    const pv = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    //
    owner.getWorldPosition(v);
    owner.parent.getWorldPosition(pv);
    // Group cannot highlight...
    if (owner.entityType === 'Group') {
      return;
    }
    const geom = lineEntity.children[0].geometry;
    geom.vertices[0].copy(v);
    geom.vertices[1].copy(pv);
    geom.verticesNeedUpdate = true;
    // Sync select colorize properties with the owner
    owner.getWorldQuaternion(q);
    owner.getWorldScale(s);
    s.multiplyScalar(1.000001);
    // Not show select wireframe when the entity is in wireframe mode
    edgeEntity.visible = !owner.children[0].material.wireframe;
    edgeEntity.position.copy(v);
    edgeEntity.quaternion.copy(q);
    edgeEntity.scale.copy(s);
    if (edgeEntity.children.length > 0 && edgeEntity.children[0] instanceof THREE.Mesh) {
      edgeEntity.children[0].position.copy(owner.children[0].position);
    }
    // Update vertex highlight group position
    vertexHighlightGroup.visible = controllerComponent.editMode === 'Vertex';
    owner.updateMatrixWorld();
    vertexHighlightGroup.matrix.copy(owner.matrixWorld);
    //
    if (owner.isNeedUpdate) {
      axisEntity.removeSelf = true;
      edgeEntity.removeSelf = true;
      vertexHighlightGroup.removeSelf = true;
      lineEntity.removeSelf = true;
      this.generateHighlightElements();
    }
  }

  stop() {
    super.stop();
    const { owner, edgeEntity, lineEntity, axisEntity, vertexHighlightGroup } = this;
    axisEntity.removeSelf = true;
    owner.isSelected = false;
    lineEntity.removeSelf = true;
    // Group cannot highlight...
    if (owner.entityType === 'Group') {
      return;
    }
    edgeEntity.removeSelf = true;
    vertexHighlightGroup.removeSelf = true;
  }
}

export default ColorizeComponent;
