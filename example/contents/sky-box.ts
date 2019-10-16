import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderRange, Vector4, RenderEngine, CullSide,
  Scene, SphereGeometry, Mesh, PerspectiveCamera, OrbitController, Shading, IBLEnvMap, TorusKnotGeometry
} from '../../src/artgl';
import { CubeTexture } from '../../src/core/texture-cube';
import { TextureSource } from '../../src/core/texture-source';
import { CubeEnvrionmentMapBackGround } from '../../src/scene/background';

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine(canvas);

  const skyCubeMap = new CubeTexture();
  skyCubeMap.negativeXMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/nx.jpg"))
  skyCubeMap.positiveXMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/px.jpg"))
  skyCubeMap.negativeYMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/ny.jpg"))
  skyCubeMap.positiveYMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/py.jpg"))
  skyCubeMap.negativeZMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/nz.jpg"))
  skyCubeMap.positiveZMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/pz.jpg"))
  const cubeEnv = new CubeEnvrionmentMapBackGround(skyCubeMap);
  cubeEnv.texture = skyCubeMap;

  const camera = new PerspectiveCamera().updateRenderRatio(engine)
  camera.transform.position.set(0, 0, 5);
  camera.lookAt(new Vector3(0, 0, 0))
  engine.useCamera(camera);

  const scene = new Scene();

  const geometry = new TorusKnotGeometry();
  const ibl = new IBLEnvMap()
  ibl.envMap = skyCubeMap;
  
  let shading = new Shading()
  .decoCamera()
  .decorate(ibl)

  const mesh = new Mesh().g(geometry).s(shading);
  scene.root.addChild(mesh);
  scene.background = cubeEnv;

  function draw() {
    engine.setClearColor(new Vector4(0.9, 0.9, 0.9, 1.0))
    engine.clearColor();
    engine.render(scene);
  }

  draw();

  //==<

  await testBridge.screenShotCompareElement(canvas, "test");

  const orbitController = new OrbitController(camera as PerspectiveCamera);
  orbitController.registerInteractor(engine.interactor);

  testBridge.resizeObserver.add((size) => {
    engine.setSize(size.width, size.height);
    camera.updateRenderRatio(engine);
  })

  testBridge.framer.setFrame(() => {
    orbitController.update();
    draw();
  })
}
