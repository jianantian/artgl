import { BufferData } from "./buffer-data";
import { Box3 } from "../math/entity/box3";
import { Sphere } from "../math/entity/sphere";
import { generateUUID } from '../math/uuid';
import { RenderRange } from "./render-object";
import { Face3 } from "../math/entity/face3";
import { Line3 } from "../math/entity/line3";
import { Vector3 } from "../math/vector3";
import { Nullable } from "../type";
import { GLProgram } from "../webgl/program";

/**
 * geometry define what to draw
 * by defined data layout and data content
 * also handle gl buffer update
 * @export
 * @class Geometry
 */
export abstract class Geometry {
  name: string = ""
  uuid = generateUUID();

  _bufferDatum: { [index: string]: BufferData } = {};
  _indexBuffer: Nullable<BufferData> = null;

  getBuffer(name: string) {
    return this._bufferDatum[name];
  }

  setBuffer(name: string, data: BufferData) {
    this._bufferDatum[name] = data;
    data.dataChanged = true; //this trigger this geometry's vao dirty
    return this;
  }

  get indexBuffer() {
    return this._indexBuffer;
  }

  set indexBuffer(value: Nullable<BufferData>) {
    this._indexBuffer = value;
    if (value !== null) {
      value.dataChanged = true; //this trigger this geometry's vao dirty
    }
  }

  setIndexBuffer(value: BufferData) {
    this.indexBuffer = value;
    return this;
  }

  checkBufferArrayChange(program: GLProgram) {
    let changed = false;
    program.forAttributes(att => {
      if (this._bufferDatum[att.name].dataChanged) {
        changed = true;
        return false;
      }
      return true;
    })
    return changed;
  }

  _shapeChanged = true;
  set shapeChanged(value: boolean) {
    this._shapeChanged = value;
    if (value) {
      this._AABBBoxNeedUpdate = true;
      this._boundingSphereNeedUpdate = true;
    }
  };

  _AABBBox: Box3 = new Box3();
  _AABBBoxNeedUpdate = true;
  abstract updateAABBBox(): void;
  get AABBBox(): Box3 {
    if (this._AABBBoxNeedUpdate) {
      this.updateAABBBox();
      this._AABBBoxNeedUpdate = false;
    }
    return this._AABBBox;
  }

  _boundingSphere: Sphere = new Sphere();
  _boundingSphereNeedUpdate = true;
  abstract updateBoundingSphere(): void;
  get boundingSphere(): Sphere {
    if (this._boundingSphereNeedUpdate) {
      this.updateBoundingSphere();
      this._boundingSphereNeedUpdate = false;
    }
    return this._boundingSphere;
  }

  buildShape() {
    this.shape();
    this.shapeChanged = true;
  }

  /**
   * creat or update the geometry's data in BufferDatum
   */
  abstract shape(): void;

  abstract foreachFace(visitor: (face: Face3) => any, range?: RenderRange): any;
  abstract foreachLineSegment(visitor: (face: Line3) => any, range?: RenderRange): any;
  abstract foreachVertex(visitor: (face: Vector3) => any, range?: RenderRange): any;

}


