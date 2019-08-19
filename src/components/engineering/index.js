/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import { Vector, Matrix } from './core/utils';
import Graphics from './core/graphics';

class Engineering extends Component {
  componentDidMount() {
    this.start();
  }

  componentWillUnmount() {
    this.stop();
  }

  start = () => {
    this.g = new Graphics(this.context);
    this.frameId = window.requestAnimationFrame(this.update);
    this.a = 0;
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.resize);
  };

  update = () => {
    const { mount, g } = this;
    mount.width = mount.clientWidth;
    mount.height = mount.clientHeight;

    g.setSize(mount.clientWidth, mount.clientHeight);
    g.clear('#ffffff');
    g.unitScale = 1 / 4;
    g.fontSize = 12;
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        const type = j + i * 3 + 1;
        const tm = new Matrix().createTranslate((mount.clientWidth / 4) * (j + 1), (mount.clientHeight / 4) * (i + 1));
        const rm = new Matrix().createAngle(this.a);
        const sm = new Matrix().createScale(40, 40);
        const m = new Matrix()
          .mult(tm)
          .mult(rm)
          .mult(sm);
        const vertices = [new Vector(1, 1), new Vector(-2, 1), new Vector(-1, -1), new Vector(1, -2)];
        if (type !== Graphics.QUAD) {
          vertices.push(new Vector(1, 1));
        }
        for (let k = 0; k < vertices.length; k += 1) {
          vertices[k].multMatrix(m);
        }
        g.addVertexBatch(vertices);
        g.render(type);
      }
    }

    this.frameId = window.requestAnimationFrame(this.update);
    this.a += 0.01;
  };

  render() {
    return (
      <canvas
        style={{ position: 'fixed', left: '0', top: '0', width: '100%', height: '100%' }}
        ref={mount => {
          // eslint-disable-next-line no-param-reassign
          mount.width = mount.clientWidth;
          // eslint-disable-next-line no-param-reassign
          mount.height = mount.clientHeight;
          const context = mount.getContext('2d');
          context.translate(0.5, 0.5);
          this.mount = mount;
          this.context = context;
        }}
      />
    );
  }
}

export default Engineering;
