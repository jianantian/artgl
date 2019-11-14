import { Vector3 } from "../vector3";

export class Vector3Observable extends Vector3{
  constructor(x?: number, y?: number, z?: number) {
    super();
    this._x = x || 0;
    this._y = y || 0;
    this._z = z || 0;
  }

  onChange = () => { };

  _x: number;
  _y: number;
  _z: number;

  get x() {
    return this._x;
  }
  set x(val) {
    if (this.onChange) {
      this.onChange();
    }
    
    this._x = val;
  }

  get y() {
    return this._y;
  }
  set y(val) {
    if (this.onChange) {
      this.onChange();
    }
    this._y = val;
  }

  get z() {
    return this._z;
  }
  set z(val) {
    if (this.onChange) {
      this.onChange();
    }
    this._z = val;
  }

}
