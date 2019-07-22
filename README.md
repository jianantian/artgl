

## About Project

ArtGL is an underdevelopment next generation webGL framework.

## Design

### easy and clear

As easy as three.js. You can regard this project as a better three.js, with better design and better code quality.

### extendable architecture

Instead of making a specific renderer for specific usage, or a general renderer that hard to extent features, artgl is a  framework for general usage. You can easily customize it, extent it to meet you real requirements.

### declarative and powerful render pipeline by renderGraph

Write a json like config for renderGraph, the rendergraph will handle all things about render procedure. Make multi pass rendering, add custom optimizer, tweaking effects, debug performance, more delightful.

### experimental shaderGraph for reliable and expressive shader source abstraction

We also use graph as the shader fragment linker. No more confusing #define #include, make shader effect development productive as well as a good abstraction for shader factory.

### experimental WebAssembly accelerated scene render data computation 

Performance matters.

....

## Sub projects

This repo also contains sub projects: example/ and viewer/

[example readme(cn/zh)](./example/README.md)

[viewer readme](./viewer/README.md)


## Posts(cn/zh)

[https://mikialex.github.io/2019/03/12/artgl-about/](https://mikialex.github.io/2019/03/12/artgl-about/)

[https://mikialex.github.io/2019/07/16/graph-based-shadersource-management/](https://mikialex.github.io/2019/07/16/graph-based-shadersource-management/)

[https://mikialex.github.io/2019/04/30/wasm-scene/](https://mikialex.github.io/2019/04/30/wasm-scene/)

[https://mikialex.github.io/2019/03/28/wasm-memory-as-data-container/](https://mikialex.github.io/2019/03/28/wasm-memory-as-data-container/)

Some old post maybe not meet the current design, just for reference;

## Some sample here:

**This may not work yet now, contribution welcomed;**

### Shading API

Decouple light effect with material effect, decorate any shading with
any other shading.

```ts

const scene = new Scene();
const light = new PointLight();

scene.add(light)

const mesh = new Mesh();

mesh.geometry = new SphereGeometry();
mesh.material = new Material();
mesh.material.channel(Channel.Diffuse).load("../diff.png");

const basicShade = new MeshBasicShading()
const shading = basicShade.decorate(lightShade);

mesh.shading = shading;
mesh.technique = shade.make();
mesh.technique.set("opacity", 0.5);


```

### RenderGraph API

```ts

const el = canvas;
const engine = new RenderEngine(canvas);
const graph = new RenderGraph(this.engine);

// this may not a real example, just demo how it looks
graph.setGraph({
  renderTargets: [
    {
      name: RenderGraph.screenRoot,
      from: () => 'CopyToScreen',
    },
    {
      name: 'sceneResult',
      from: () => 'SceneOrigin',
    },
    {
      name: 'depthResult',
      from: () => 'Depth',
    },
    ...
  ],
  passes: [
    { // general scene origin
      name: "SceneOrigin",
      source: [this.scene],
    },
    { // depth
      name: "Depth",
      technique: depthTech,
      source: [this.scene],
    },
    { // mix new results with old samples
      name: "TAA",
      inputs: () => {
        return {
          sceneResult: "sceneResult",
          depthResult: "depthResult",
          TAAHistoryOld: this.isEvenTick ? "TAAHistoryA" : "TAAHistoryB",
        }
      },
      technique: TAATech,
      source: [RenderGraph.quadSource],
      enableColorClear: false,
      beforePassExecute: () => {
        this.engine.unJit();
        const VPInv: Matrix4 = TAATech.uniforms.get('VPMatrixInverse').value;
        const VP: Matrix4 = this.engine.getGlobalUniform(InnerSupportUniform.VPMatrix).value
        VPInv.getInverse(VP, true);
        TAATech.uniforms.get('VPMatrixInverse').setValueNeedUpdate();
        TAATech.uniforms.get('u_sampleCount').setValue(this.sampleCount);
      },
    }
    ...
  ]
})

```

### ShaderGraph API

```ts

// this may not a real example, just demo how it looks

export class TSSAOShading extends Shading {
  update() {
    const VPMatrix = innerUniform(InnerSupportUniform.VPMatrix);
    const sampleCount = uniform("u_sampleCount", GLDataType.float).default(0);
    const depthTex = texture("depthResult");
    this.graph.reset()
      .setVertexRoot(
        vec4(attribute(
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
      ), constValue(1)))
      .setVary("v_uv", attribute(
        { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv }
      ))

    const vUV = this.graph.getVary("v_uv");
    const depth = unPackDepth.make().input("enc", depthTex.fetch(vUV))

    const worldPosition = getWorldPosition.make()
      .input("uv", vUV)
      .input("depth", depth)
      .input("VPMatrix", VPMatrix)
      .input("VPMatrixInverse", uniform("VPMatrixInverse", GLDataType.Mat4).default(new Matrix4()))

    const Random2D1 = rand2DT.make()
      .input("cood", vUV)
      .input("t", sampleCount)
    
    const Random2D2 = rand.make()
    .input("n", Random2D1)
    
    const randDir = dir3D.make()
      .input("x", Random2D1)
      .input("y", Random2D2)

    const newPositionRand = newSamplePosition.make()
      .input("positionOld", worldPosition.swizzling("xyz"))
      .input("distance", uniform("u_aoRadius", GLDataType.float).default(1))
      .input("dir", randDir)

    const newDepth = unPackDepth.make()
      .input("enc",
        depthTex.fetch(
          NDCxyToUV.make()
            .input(
              "ndc", NDCFromWorldPositionAndVPMatrix.make()
                .input(
                  "position", newPositionRand
                ).input(
                  "matrix", VPMatrix
                )
            )
        )
      )

    this.graph.setFragmentRoot(
      tssaoMix.make()
        .input("oldColor", texture("AOAcc").fetch(vUV).swizzling("xyz"))
        .input("newColor",
          sampleAO.make()
            .input("depth", depth)
            .input("newDepth", newDepth)
        )
        .input("sampleCount", sampleCount)
    )
  }
}
```