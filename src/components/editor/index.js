/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import Engine from './core/engine';
import ContextMenu from '../context-menu';
import { LeftMenu } from '../left-menu';
import * as MenuAction from '../left-menu/actions';

class Editor extends Component {
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    setTimeout(() => {
      MenuAction.startBatch();
      MenuAction.addTab({
        id: 'tab1',
        type: 'tab',
        label: 'Tab 1',
        children: [],
      });
      MenuAction.addTab({
        id: 'tab2',
        type: 'tab',
        label: 'Tab 2',
        children: [],
      });
      MenuAction.addTab({
        id: 'tab3',
        type: 'tab',
        label: 'Tab 3',
        children: [],
      });
      MenuAction.addMenuItem('tab1', {
        id: 'sceneFolder',
        type: 'accordion',
        label: 'Scene',
        value: false,
      });
      MenuAction.addMenuItem('tab1', {
        id: 'objectInfo',
        type: 'accordion',
        label: 'Object Information',
        value: false,
      });
      MenuAction.addMenuItem('tab1', {
        id: 'objectCreate',
        type: 'accordion',
        label: 'Create',
        value: false,
      });
      MenuAction.addMenuItem('tab1', {
        id: 'mode',
        type: 'accordion',
        label: 'Mode',
        value: false,
      });
      MenuAction.addMenuItem('tab1', {
        id: 'camera',
        type: 'accordion',
        label: 'Camera',
        value: false,
      });
      MenuAction.endBatch();
    });

    const engine = new Engine(width, height);
    this.engine = engine;
    this.mount.appendChild(engine.renderer.domElement);
    this.start();
    this.clickCount = 0;
    this.mouseUpCount = 0;
  }

  componentWillUnmount() {
    this.stop();
    MenuAction.removeMenuChilds();
  }

  start = () => {
    this.frameId = window.requestAnimationFrame(this.update);
    window.addEventListener('resize', this.resize);
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.resize);
  };

  resize = () => {
    const { engine } = this;
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    engine.resize(width, height);
  };

  update = () => {
    const { engine } = this;
    if (this.mouseUpCount > 0) {
      engine.inputMouse.type = '';
      this.mouseUpCount -= 1;
    }
    engine.update();
    this.frameId = window.requestAnimationFrame(this.update);
  };

  onKeyEvent = e => {
    const { engine } = this;
    engine.inputKeys.type = e.type;
    switch (e.type) {
      case 'keydown':
        engine.inputKeys.keys[e.key] = true;
        break;
      case 'keyup':
        engine.inputKeys.keys[e.key] = false;
        break;
      default:
        break;
    }
    e.stopPropagation();
  };

  onMouseEvent = e => {
    const { engine } = this;
    if (this.mouseUpCount > 0) {
      engine.inputMouse.type = '';
      this.mouseUpCount -= 1;
      return;
    }
    engine.inputMouse.type = e.type;
    engine.inputMouse.which = 0;
    switch (e.type) {
      case 'mousewheel':
      case 'DOMMouseScroll':
      case 'wheel':
        if (e.nativeEvent) {
          engine.inputMouse.wheelDelta = e.nativeEvent.deltaY > 0 ? 1 : -1;
          engine.inputMouse.type = 'wheel';
        } else if (e.originalEvent) {
          engine.inputMouse.wheelDelta = e.originalEvent.deltaY > 0 ? 1 : -1;
          engine.inputMouse.type = 'wheel';
        }
        break;
      case 'mousedown':
        this.clickCount += 1;
        if (this.clickCount === 1) {
          setTimeout(() => {
            this.clickCount = 0;
          }, 250);
        }
        if (this.clickCount === 2) {
          engine.inputMouse.type = 'mousedoubledown';
          this.clickCount = 0;
        }
        engine.inputMouse.which = e.nativeEvent.which;
        if (e.nativeEvent.which === 1) {
          engine.inputMouse.left = true;
        }
        if (e.nativeEvent.which === 2) {
          engine.inputMouse.middle = true;
        }
        if (e.nativeEvent.which === 3) {
          engine.inputMouse.right = true;
        }
        break;
      case 'mouseup':
        this.mouseUpCount = 2;
        engine.inputMouse.which = e.nativeEvent.which;
        if (e.nativeEvent.which === 1) {
          engine.inputMouse.left = false;
        }
        if (e.nativeEvent.which === 2) {
          engine.inputMouse.middle = false;
        }
        if (e.nativeEvent.which === 3) {
          engine.inputMouse.right = false;
        }
        break;
      default:
        break;
    }

    const bounds = e.target.getBoundingClientRect();
    engine.inputMouse.x = e.clientX - bounds.left;
    engine.inputMouse.y = e.clientY - bounds.top;
    engine.inputMouse.screenX = e.clientX;
    engine.inputMouse.screenY = e.clientY;
    e.stopPropagation();
  };

  onBlur = () => {
    this.engine.focused = false;
  };

  onFocus = () => {
    this.engine.focused = true;
  };

  render() {
    return (
      <React.Fragment>
        <ContextMenu />
        <div
          className="left-menu-material-ui"
          style={{
            position: 'fixed',
            left: '0',
            top: '53px',
            width: '300px',
            height: 'calc(100% - 57px)',
            overflowY: 'scroll',
          }}
        >
          <LeftMenu />
        </div>
        <div
          className="editor-material-ui"
          tabIndex="0"
          style={{
            position: 'fixed',
            left: '304px',
            top: '53px',
            width: 'calc(100% - 308px)',
            height: 'calc(100% - 57px)',
            background: '#AAAAAA',
            cursor: 'default',
          }}
          onMouseLeave={() => {
            this.engine.inputMouse = {};
          }}
          onMouseDown={this.onMouseEvent}
          onMouseUp={this.onMouseEvent}
          onMouseMove={this.onMouseEvent}
          onKeyDown={this.onKeyEvent}
          onKeyUp={this.onKeyEvent}
          onWheel={this.onMouseEvent}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          onContextMenu={e => e.preventDefault()}
          ref={mount => {
            this.mount = mount;
          }}
        />
      </React.Fragment>
    );
  }
}

export default Editor;
