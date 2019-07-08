import { RenderSource } from "../engine/render-engine";
import { Mesh } from "../object/mesh";
import { PlaneGeometry } from "../geometry/geo-lib/plane-geometry";

const quadMesh = new Mesh();
const geometry = new PlaneGeometry(2, 2, 1, 1);
quadMesh.geometry = geometry;
export class QuadSource implements RenderSource{
  hasRendered: false;

  resetSource() {
    this.hasRendered = false;
  }

  nextRenderable() {
    if (this.hasRendered) {
      return null
    }
    return quadMesh
  }

  updateSource() {}

}
