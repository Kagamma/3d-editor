import BaseComponent from './base-component';
import * as MenuAction from '../../left-menu/actions';

class SceneComponent extends BaseComponent {
  static isNeedUpdate = false;

  constructor(engine) {
    super();
    this.engine = engine;
    this.parent = [];
  }

  start() {
    const { owner } = this;
    // Scene
    setTimeout(() => {
      MenuAction.addMenuItem('sceneFolder', {
        id: 'scene',
        type: 'scene',
        object: this,
        property: 'parent',
        color: 'primary',
        onClick: (item, entity) => {
          if (!entity.findComponent('focus')) {
            const controller = owner.findComponent('controller');
            controller.selectEntity(entity);
          }
        },
        onDoubleClick: (item, entity) => {
          if (!entity.findComponent('focus')) {
            const controller = owner.findComponent('controller');
            controller.selectEntity(entity);
            controller.focusEntity(entity);
          }
        },
        onContextMenu: (item, entity, e) => {
          this.engine.inputMouse.screenX = e.clientX;
          this.engine.inputMouse.screenY = e.clientY;
          if (e.nativeEvent.which === 3) {
            const controller = owner.findComponent('controller');
            if (controller.editMode === 'Object') {
              controller.selectEntity(entity);
              controller.showContextMenu();
            }
          }
        },
      });
    }, 1000);
  }

  update() {
    const { engine } = this;
    if (SceneComponent.isNeedUpdate) {
      this.parent = [];
      engine.scene.children.forEach(entity => {
        if (entity.entityType && entity.entityType !== 'Vertex') {
          this.parent.push(entity);
        }
      });
      SceneComponent.isNeedUpdate = false;
      MenuAction.refresh();
    }
  }
}

export default SceneComponent;
