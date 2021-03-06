
import { Nullable } from "@artgl/shared";
import { RenderTargetNode } from "./node/render-target-node";
import { PassGraphNode } from "./node/pass-graph-node";
import { Vector4, Vector4Like } from "@artgl/math";
import { RenderGraphBackEnd, FBOProvider } from "./interface"

export type uniformName = string;
type framebufferName = string;

export class RenderPass {
  constructor(passNode: PassGraphNode, outputNode: RenderTargetNode) {
    this.passNode = passNode;
    this.outputTarget = outputNode;
    passNode.updatePass(this);
  }
  passNode: PassGraphNode;

  private beforeClearColor: Vector4Like = new Vector4(1, 1, 1, 1);

  uniformNameFBOMap: Map<uniformName, framebufferName> = new Map();
  uniformRenderTargetNodeMap: Map<uniformName, RenderTargetNode> = new Map();
  framebuffersDepends: Set<RenderTargetNode> = new Set();

  // outputInfos
  outputTarget: RenderTargetNode;

  get isOutputScreen() {
    return this.outputTarget.isScreenNode;
  }

  renderDebugResult(
    engine: RenderGraphBackEnd,
    framebuffer: FBOProvider
  ) {
    const debugOutputViewport = this.outputTarget.debugViewPort;
    engine.renderFrameBuffer(framebuffer, debugOutputViewport)
    // this will cause no use draw TODO optimize
    this.uniformNameFBOMap.forEach((inputFramebufferName, uniformName) => {
      const dependFramebuffer = engine.getFramebuffer(inputFramebufferName)!;
      const debugInputViewport = this.uniformRenderTargetNodeMap.get(uniformName)!.debugViewPort;
      engine.renderFrameBuffer(dependFramebuffer, debugInputViewport)
    })
  }

  execute(
    engine: RenderGraphBackEnd,
    framebuffer: Nullable<FBOProvider>,
    enableDebuggingView: boolean = false,
  ) {

    let outputTarget: FBOProvider;

    // setup viewport and render target
    if (this.isOutputScreen) {
      engine.setRenderTargetScreen();
      if (enableDebuggingView) {
        const debugViewPort = this.outputTarget.debugViewPort;
        engine.setViewport(
          debugViewPort.x, debugViewPort.y,
          debugViewPort.z, debugViewPort.w
        );

      } else {
        engine.setFullScreenViewPort();
      }
    } else {
      outputTarget = framebuffer!;
      engine.setRenderTarget(outputTarget);
      engine.setViewport(0, 0, this.outputTarget.widthAbs, this.outputTarget.heightAbs);
    }

    // input binding 
    const overrideShading = this.passNode._overrideShading;
    if (overrideShading !== null) {
      engine.setOverrideShading(overrideShading);
      this.uniformNameFBOMap.forEach((inputFramebufferName, uniformName) => {
        overrideShading.defineFBOInput(
          inputFramebufferName, uniformName
        );
      })
    }


    engine.getClearColor(this.beforeClearColor);
    // clear setting
    if (this.passNode._enableColorClear) {
      engine.setClearColor(this.passNode._clearColor);
      engine.clearColor();
    }
    if (this.passNode._enableDepthClear) {
      if (this.isOutputScreen || this.outputTarget.enableDepth) {
        engine.clearDepth();
      }
    }

    //////  render //////
    this.passNode.source.forEach(source => {
      source(engine);
    })
    /////////////////////

    engine.setOverrideShading(null);
    engine.setClearColor(this.beforeClearColor);


    if (enableDebuggingView && !this.isOutputScreen) {
      this.renderDebugResult(engine, framebuffer!);
    }

  }

  checkIsValid() {
    if (this.isOutputScreen) {
      return
    }
    if (this.passNode.source.length === 0) {
      throw 'your pass has no render source'
    }

    const target = this.outputTarget.name;
    this.uniformNameFBOMap.forEach(input => {
      if (input === target) {
        throw `you cant output to the render target which is depend on: 
Duplicate target: ${this.outputTarget.name};`
      }
    })
  }
}