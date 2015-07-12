module RendererUtils {
  export function  copyBuffer(source: any, dest: any):void {
    for(var i = 0; i < source.length; i++) {
      dest[i] = source[i];
    }
  }

  export function copyArray(source: Array<any>, dest: Array<any>):void {
    for(var i = 0; i < source.length; i++) {
      dest[i] = source[i];
    }
  }
}
