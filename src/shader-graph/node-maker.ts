import { AttributeDescriptor } from "../webgl/attribute";
import { ShaderAttributeInputNode, ShaderCommonUniformInputNode, ShaderInnerUniformInputNode, ShaderTexture, ShaderNode, ShaderConstType, ShaderConstNode, ShaderCombineNode } from "./shader-node";
import { GLDataType } from "../webgl/shader-util";
import { InnerSupportUniform, InnerUniformMap } from "../webgl/uniform/uniform";
import { GLTextureType } from "../webgl/uniform/uniform-texture";

// TODO simplify it
export function attribute(att: AttributeDescriptor) {
  return new ShaderAttributeInputNode(att);
}

export function texture(name: string, type?: GLTextureType) {
  const t = type !== undefined ? type :  GLTextureType.texture2D;
  return new ShaderTexture(name, t);
}

export function uniform(name: string, type: GLDataType) {
  return new ShaderCommonUniformInputNode({
    name, type
  })
}

export function innerUniform(type: InnerSupportUniform) {
  return new ShaderInnerUniformInputNode({
    name: 'inner' + InnerUniformMap.get(type).name,
    mapInner: type,
  })
}

export function value(value: ShaderConstType){
  return new ShaderConstNode(value);
}

export function vec2(...args: ShaderNode[] ) {
  return new ShaderCombineNode(args, GLDataType.floatVec2)
}

export function vec3(...args: ShaderNode[] ) {
  return new ShaderCombineNode(args, GLDataType.floatVec3)
}

export function vec4(...args: ShaderNode[] ) {
  return new ShaderCombineNode(args, GLDataType.floatVec4)
}

export function constValue(value: any){
  return new ShaderConstNode(value);
}