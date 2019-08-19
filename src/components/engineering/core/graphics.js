/**
 * Trung:
 * Common size-aware 2D drawing routines goes here
 */

import { Vector, Matrix } from './utils';
import Utils from '../../editor/core/utils';

class Graphics {
  static LINE = 1;

  static LINE_DASH = 2;

  static ARROW = 3;

  static ARROW_DASH = 4;

  static ARROW_BOTH = 5;

  static ARROW_BOTH_DASH = 6;

  static QUAD = 7;

  static QUAD_FILL = 8;

  constructor(ctx, width = 0, height = 0) {
    this.vertices = [];
    this.infos = [];
    this.ctx = ctx;
    this.strokeColor = '#000000';
    this.fillColor = '#000000';
    this.setSize(width, height);
    this.lineDash = [5, 5];
    this.fontSize = 14;
    this.unitScale = 1;
  }

  /**
   * Set canvas size and calculate projection matrix
   * @param {*} width
   * @param {*} height
   */
  setSize(width, height) {
    const tm = new Matrix().createTranslate(0, height);
    const rm = new Matrix();
    rm.data[4] = -1;
    this.matrix = new Matrix().mult(tm).mult(rm);
    this.width = width;
    this.height = height;
  }

  /**
   * Add a vertex
   */
  addVertex = (a, b) => {
    if (b) {
      this.vertices.push(Vector.create(a, b));
    } else {
      this.vertices.push(a);
    }
  };

  /**
   * Add a batch of vertices
   */
  addVertexBatch = a => {
    this.vertices = this.vertices.concat(a);
  };

  /**
   * Add a info
   */
  addInfo = i => {
    this.infos.push(i);
  };

  /**
   * Add a batch of infos
   */
  addInfoBatch = a => {
    this.infos = this.infos.concat(a);
  };

  renderLine(drawType) {
    const { vertices, ctx } = this;
    if (drawType === Graphics.LINE_DASH) {
      ctx.setLineDash(this.lineDash);
    }
    ctx.beginPath();
    //
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i += 1) {
      const v = vertices[i];
      ctx.lineTo(v.x, v.y);
    }
    ctx.stroke();
    // Restore dash to solid
    if (drawType === Graphics.LINE_DASH) {
      ctx.setLineDash([]);
    }
  }

  renderArrow(drawType) {
    const { vertices, ctx } = this;
    const drawArrowHead = (v1, v2) => {
      const vInv = v1.clone().sub(v2);
      const angle = vInv.angle();
      const arrowVector1 = v2
        .clone()
        .add(new Vector().createAngle(angle + Utils.degToRad(20)).scale(new Vector(12, 12)));
      const arrowVector2 = v2
        .clone()
        .add(new Vector().createAngle(angle + Utils.degToRad(-20)).scale(new Vector(12, 12)));

      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(v2.x, v2.y);
      ctx.lineTo(arrowVector1.x, arrowVector1.y);
      ctx.lineTo(arrowVector2.x, arrowVector2.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.fillStype = '#000000';
      ctx.fill();
      ctx.stroke();
    };

    if (drawType === Graphics.ARROW_DASH || drawType === Graphics.ARROW_BOTH_DASH) {
      ctx.setLineDash(this.lineDash);
    }
    ctx.beginPath();
    //
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i += 1) {
      const v = vertices[i];
      ctx.lineTo(v.x, v.y);
      // We draw arrow if this is the end of the line
      ctx.stroke();
      drawArrowHead(vertices[i - 1], vertices[i]);
      if (drawType === Graphics.ARROW_BOTH_DASH || drawType === Graphics.ARROW_BOTH) {
        drawArrowHead(vertices[i], vertices[i - 1]);
      }

      // Restore moveTo value...
      if (drawType === Graphics.ARROW_DASH || drawType === Graphics.ARROW_BOTH_DASH) {
        ctx.setLineDash(this.lineDash);
      }
      ctx.beginPath();
      ctx.moveTo(v.x, v.y);
    }
    ctx.stroke();
    // Restore dash to solid
    ctx.setLineDash([]);
  }

  renderQuad(drawType) {
    const { vertices, ctx } = this;
    const patternImage = document.getElementById('pattern');
    ctx.beginPath();
    //
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i += 1) {
      const v = vertices[i];
      ctx.lineTo(v.x, v.y);
      if ((i + 1) % 4 === 0) {
        const vs = vertices[i - 3];
        ctx.lineTo(vs.x, vs.y);
        if (drawType === Graphics.QUAD_FILL) {
          const pattern = ctx.createPattern(patternImage, 'repeat');
          ctx.fillStyle = pattern;
          ctx.fill();
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(v.x, v.y);
      }
    }
    ctx.stroke();
  }

  renderLineInfo() {
    const { vertices, infos, ctx } = this;
    for (let i = 0; i < vertices.length - 1; i += 1) {
      const v1 = vertices[i];
      const v2 = vertices[i + 1];
      const v = new Vector(Utils.lerp(v1.x, v2.x, 0.5), Utils.lerp(v1.y, v2.y, 0.5));
      let angle = Utils.clampAngle(
        v2
          .clone()
          .sub(v)
          .angle() + Utils.degToRad(90)
      );
      if (angle < Math.PI) {
        angle += Math.PI;
      }
      const pos = v.clone().add(new Vector().createAngle(angle).scale(new Vector(7, 7)));
      // Generate default info based of line length
      let len;
      if (infos.length === 0) {
        len = `${parseFloat(
          this.unitScale *
            v1
              .clone()
              .sub(v2)
              .length()
              .toFixed(0)
        )}mm`;
      } else {
        len = infos[i];
      }
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(angle + Utils.degToRad(90));
      ctx.font = `${this.fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillStyle = this.fillColor;
      ctx.fillText(len, 0, 0);
      ctx.restore();
    }
  }

  /**
   * Perform draw
   */
  render = drawType => {
    const { vertices, ctx, matrix } = this;
    //
    ctx.strokeStyle = this.strokeColor;
    // Translate vectors
    for (let i = 0; i < vertices.length; i += 1) {
      vertices[i].multMatrix(matrix);
    }
    switch (drawType) {
      case Graphics.LINE_DASH:
      case Graphics.LINE:
        this.renderLine(drawType);
        break;
      case Graphics.ARROW_DASH:
      case Graphics.ARROW:
      case Graphics.ARROW_BOTH_DASH:
      case Graphics.ARROW_BOTH:
        this.renderArrow(drawType);
        break;
      case Graphics.QUAD:
      case Graphics.QUAD_FILL:
        this.renderQuad(drawType);
        break;
      default:
        break;
    }
    // We draw text info between lines
    switch (drawType) {
      case Graphics.LINE:
      case Graphics.LINE_DASH:
      case Graphics.ARROW_DASH:
      case Graphics.ARROW:
      case Graphics.ARROW_BOTH_DASH:
      case Graphics.ARROW_BOTH:
        this.renderLineInfo();
        break;
      default:
        break;
    }
    this.vertices = [];
    this.infos = [];
  };

  /**
   * Clear the canvas
   * @param {*} color
   */
  clear(color) {
    const { ctx, width, height } = this;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }
}

export default Graphics;
