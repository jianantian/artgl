export const enum AttributeType{
  float,
  int
}

export const enum AttributeUsage{
  position,
  normal,
  color,
  uv
}

export class Attribute{
  constructor(type: AttributeType, stride: number, size:number) {
    this.data = new Float32Array(size);
    this.count = size / stride;
    this.stride = stride;
    if (this.count !== Math.ceil(this.count)) {
      throw 'size dont match stride'
    }
  }
  data: any;
  count: number = 0;
  stride: number = 1;

  setIndex(index:number, value:number) {
    this.data[index * this.stride] = value;
  }

  setData(data:any) {
    this.data = data;
  }
  
}