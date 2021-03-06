import { MathUtil } from "@artgl/math";
import { Camera, ProjectionMatrixNeedUpdate } from "../core/camera";
import { ScreenSpaceRayProvider, Raycaster } from "../core/raycaster";

export class PerspectiveCamera extends Camera implements ScreenSpaceRayProvider {
  constructor(near?: number, far?: number,
    fov?: number, aspect?: number, zoom?: number) {
    super();
    
    this.fov = fov !== undefined ? fov : 50;
    this.zoom = zoom !== undefined ? zoom : 1;

    this.near = near !== undefined ? near : 0.1;
    this.far = far !== undefined ? far : 2000;

    this.aspect = aspect !== undefined ? aspect : 1;

    this.updateProjectionMatrix();
  }

  
  @ProjectionMatrixNeedUpdate
  near: number = 0.1;
  
  @ProjectionMatrixNeedUpdate
  far: number = 2000;

  @ProjectionMatrixNeedUpdate
  fov: number = 50;
  
  @ProjectionMatrixNeedUpdate
  aspect: number = 1;
  
  @ProjectionMatrixNeedUpdate
  zoom: number = 1;

  get width() {
    return this.aspect * this.height;
  }
  get height() {
    return 2 * this.near * Math.tan(MathUtil.DEG2RAD * 0.5 * this.fov) / this.zoom;
  }

  updateProjectionMatrix() {
    const top = this.near * Math.tan(MathUtil.DEG2RAD * 0.5 * this.fov) / this.zoom;
    const height = 2 * top;
    const width = this.aspect * height;
    const left = - 0.5 * width;
    this._projectionMatrix.makePerspective(left, left + width, top, top - height, this.near, this.far);
  }

  updateRaycaster(caster: Raycaster, xRate: number, yRate: number): void {
    caster.worldRay.origin.setFromMatrixPosition(this.transform.matrix); //todo world
    caster.worldRay.direction.set(xRate, yRate, 0.5)
      .unProject(this.transform.matrix, this.projectionMatrix)
      .sub(caster.worldRay.origin)
      .normalize();
  }

  onRenderResize = (width: number, height: number) => {
    this.aspect = width / height;
  }

}

export const PerspectiveCameraInstance = new PerspectiveCamera();