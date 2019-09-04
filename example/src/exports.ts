import renderRange from '../contents/render-range'
import testDrawPrimitive from '../contents/draw-primitives'
import barycentric from '../contents/barycentric-wireframe'
import { HeadlessTestBridge } from './test-bridge'

type ConstructorTypeOf<T> = new (...args: any[]) => T;

// This should impl by node puppeteer, and exposed on headless window
// declare function screenShotCompareElement(element: HTMLElement, goldenPath: string);
declare global {
  interface Window {
    artglExamples: Example[],
    HeadlessTestBridge: ConstructorTypeOf<HeadlessTestBridge>;
    screenShotCompareElement(element: HTMLElement, goldenPath: string): Promise<void>;
  }
}

interface Example{
  name: string,  // show in url
  title: string, // show in title
  description?: string, // des text
  build: Function
}

export const examples: Example[] = [
  {
    name: "primitive",
    title: "Primitive type",
    description: "Different draw mode, mesh / line / points",
    build: testDrawPrimitive
  },
  {
    name: "render-range",
    title: "Use RenderRange",
    build: renderRange
  },
  {
    name:  "barycentric-wireframe",
    title: "Barycentric wireframe shading",
    build: barycentric
  }
];


window.artglExamples = examples;
window.HeadlessTestBridge = HeadlessTestBridge
