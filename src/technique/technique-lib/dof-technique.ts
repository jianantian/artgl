import { Technique } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { Matrix4 } from "../../math/matrix4";
import { GLTextureType } from "../../webgl/uniform/uniform-texture";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";

const vertexShaderSource =
  `
    void main() {
      gl_Position = vec4(position, 1.0);
      v_uv = uv;
    }
    `
const fragmentShaderSource =
  `
    void main() {
      float depthColorBuffer = texture2D(depthBuffer, v_uv).r;
      vec3 normalBuffer = texture2D(sceneBuffer, v_uv).rgb;
      gl_FragColor = vec4(vec3(depthColorBuffer) + normalBuffer, 1.0);
      // gl_FragColor = vec4(vec3(1.0,0.0,0.0), 1.0);
    }
    `

export class DOFTechnique extends Technique {
  constructor() {
    const config = {
      programConfig: {
        attributes: [
          { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
          { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv, stride: 2 },
        ],
        varyings: [
          {name:'v_uv', type: GLDataType.floatVec2},
        ],
        textures: [
          {name: 'depthBuffer', type: GLTextureType.texture2D},
          {name: 'sceneBuffer', type: GLTextureType.texture2D}
        ],
        vertexShaderString: vertexShaderSource,
        fragmentShaderString: fragmentShaderSource,
        autoInjectHeader: true,
      }
    }
    super(config);
  }

}