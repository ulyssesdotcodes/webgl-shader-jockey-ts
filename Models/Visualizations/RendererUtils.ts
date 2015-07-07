module RendererUtils {
  export function  copyBuffer(source: Uint8Array, dest: Uint8Array):void {
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
