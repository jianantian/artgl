
ArtGL is a TypeScript WebGL framework.

## Design & Features

### easy and clear

As easy as three.js. You can regard this project as a better three.js, maybe with better design and better code quality. Many code referenced from three.js :)

### extendable architecture

Instead of making a specific renderer for specific usage, or a general renderer that hard to extent features, artgl is a  framework for general usage. You can easily customize it, extent it to meet you real requirements.

### declarative render pipeline by renderGraph API

Write a json like config for renderGraph, the rendergraph will handle all things about render procedure. Auto support FBO reuse. Make multi pass rendering, add custom optimizer, tweaking effects, debug performance, more delightful than before.

### expressive shading abstraction by shaderGraph API

We also use graph as the shader fragment linker. Its a revolutionary improvement of composability in shader source and shader computation abstraction.  No more confusing #define #include. Make shader effect development productive and provide a sound abstraction in artgl  shading model.

### experimental WebAssembly accelerated scene render data computation 

Performance matters.

....

## projects

source: [https://github.com/mikialex/artgl](https://github.com/mikialex/artgl)

This repo also contains sub projects: example/ and viewer/

[example readme(cn/zh)](./example/README.md)

[viewer readme](./viewer/README.md)

## demos

[viewer demo](https://mikialex.github.io/artgl/viewer/dist/#/)

## Posts(cn/zh)

[https://mikialex.github.io/2019/08/11/fbo-reuse-in-rendergraph-artgl/](https://mikialex.github.io/2019/08/11/fbo-reuse-in-rendergraph-artgl/)

[https://mikialex.github.io/2019/08/03/uniform-upload-design/](https://mikialex.github.io/2019/08/03/uniform-upload-design/)

[https://mikialex.github.io/2019/07/16/graph-based-shadersource-management/](https://mikialex.github.io/2019/07/16/graph-based-shadersource-management/)

[https://mikialex.github.io/2019/03/12/artgl-about/](https://mikialex.github.io/2019/03/12/artgl-about/)

[https://mikialex.github.io/2019/07/16/graph-based-shadersource-management/](https://mikialex.github.io/2019/07/16/graph-based-shadersource-management/)

[https://mikialex.github.io/2019/04/30/wasm-scene/](https://mikialex.github.io/2019/04/30/wasm-scene/)

[https://mikialex.github.io/2019/03/28/wasm-memory-as-data-container/](https://mikialex.github.io/2019/03/28/wasm-memory-as-data-container/)

Some old post maybe not meet the current design, just for reference;

## Some sample here:

**This may not work yet now, contribution welcomed;**

### Shading API

Decorate shading with any other shading decorator. Provide uniform block with extendable shading provider.

```ts
  ...
  const pointLight = new PointLight();
  pointLight.position = new Vector3(-1, 3, 3);
  pointLight.color = new Vector3(0.9, 0.8, 0.5);
  pointLight.radius = 10;

  const ambient = new AmbientLight();
  ambient.color = new Vector3(0.3, 0.3, 0.4);

  const dirLight = new DirectionalLight();
  dirLight.color = new Vector3(0.3, 0.6, 0.8);
  dirLight.direction = new Vector3(1, 1, -1).normalize();

  const exposureController = new ExposureController();

  const phong = new PhongShading<DirectionalLight | PointLight>([dirLight, pointLight]);

  let shading = new Shading()
    .decorate(phong)
    .decorate(ambient)
    .decorate(exposureController)

  const planeMesh = new Mesh().g(planeGeo).s(shading)
  root.addChild(planeMesh);
  ...

```

### ShaderGraph API


```ts
export class PhongShading<T> extends BaseEffectShading<PhongShading<T>> {
  constructor(lights: Array<Light<T>>) {
    super();
    this.lights = lights
  }

  decorate(graph: ShaderGraph): void {
    graph.setFragmentRoot(
      collectLightNodes<T>(this.lights,
        (light) => {
        return phongShading.make()
        .input("lightDir", light.produceLightFragDir(graph))
        .input("lightIntensity", light.produceLightIntensity(graph))
        .input("surfaceNormal", graph.getVary(NormalFragVary))
        .input("eyeDir", graph.getEyeDir())
        .input("shininess", this.getPropertyUniform("shininess"))
      })
    )
  }

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    visitor(this);
    this.lights.forEach(light => {
      visitor(light);
    })
  }

  lights: Array<Light<T>>

  @MapUniform("shininess")
  shininess: number = 15;

}
```

```ts

// this may not a real example, just demo how it looks

export class TSSAOShading extends BaseEffectShading<TSSAOShading> {
  
  @MapUniform("u_sampleCount")
  sampleCount: number = 0;

  @MapUniform("VPMatrixInverse")
  VPMatrixInverse: Matrix4 = new Matrix4()

  @MapUniform("u_aoRadius")
  aoRadius: number = 1

  decorate(graph: ShaderGraph) {
    const VPMatrix = innerUniform(InnerSupportUniform.VPMatrix);
    const sampleCount = this.getPropertyUniform("sampleCount");
    const depthTex = texture("depthResult");
    graph
      .setVertexRoot(screenQuad())
      .declareFragUV()

    const vUV = graph.getVary(UvFragVary);
    const depth = unPackDepth.make().input("enc", depthTex.fetch(vUV))

    const worldPosition = getWorldPosition.make()
      .input("uv", vUV)
      .input("depth", depth)
      .input("VPMatrix", VPMatrix)
      .input("VPMatrixInverse", this.getPropertyUniform("VPMatrixInverse"))

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
      .input("distance", this.getPropertyUniform("aoRadius"))
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

    graph.setFragmentRoot(
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

### RenderGraph API

```ts

...
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