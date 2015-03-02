/// <reference path="../typed/rx.jquery.d.ts"/>

class ShaderLoader {
  public static getShaderFromServer(name: string): Rx.Observable<THREE.ShaderMaterial> {
    return Rx.Observable.combineLatest(ShaderLoader.getVertex(name), ShaderLoader.getFragment(name),
      (frag, vert) => new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag
      })); 
  }

  private static getVertex(name: string): Rx.Observable<string> {
    return $.ajaxAsObservable<ShaderResponse>({
      url: '/shaders/' + name
    }).map((shader) => shader.responseText)
  }

  private static getFragment(name: string): Rx.Observable<string> {
    return $.ajaxAsObservable<ShaderResponse>({
      url: '/shaders/' + name + '.frag'
    }).map((shader) => shader.responseText)
  }
}

interface ShaderResponse {
  responseText: string;
}