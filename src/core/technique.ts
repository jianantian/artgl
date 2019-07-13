import { generateUUID } from "../math/index";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { ARTEngine } from "../engine/render-engine";
import { UniformProxy } from "../engine/uniform-proxy";
import { ShaderGraph } from "../shader-graph/shader-graph";

/**
 * Technique defined how to draw a things typically, one technique is corespondent to a gl program.
 * Program's shader and infos are defined in technique config.
 * Technique config is wrap a program config that the engine will use this to tell the
 *  under layer gl renderer to create and compiled shader.
 */
export class Technique{
  constructor() {
    this.update();
    this.needRebuildShader = false;
    this.createProgramConfig();
    this.graph.compile();
  }
  graph: ShaderGraph = new ShaderGraph();
  needRebuildShader: boolean = true;
  _programConfigCache: GLProgramConfig;

  name: string = "no named technique";
  uuid: string = generateUUID();
  _techniqueId: string;

  isTransparent = false;

  uniforms: Map<string, UniformProxy> = new Map();

  /**
   * impl this to build your shader source
   */
  update() {
    throw "technique not impl"
  }

  getProgram(engine: ARTEngine): GLProgram {
    if (this.needRebuildShader) {
      this.disposeProgram(engine);
      this.update();
      this.needRebuildShader = false;
    }
    let program = engine.getProgram(this);
    if (program === undefined) {
      program = engine.createProgram(this);
    }
    return program;
  }

  createProgramConfig(): GLProgramConfig{
    const config = this.graph.compile();
    this.uniforms.clear();
    config.uniforms.forEach(uniform => {
      this.uniforms.set(uniform.name, new UniformProxy(uniform.default));
    })
    this._programConfigCache = config;
    return config;
  }

  disposeProgram(engine: ARTEngine): void {
    engine.deleteProgram(this);
  }

}