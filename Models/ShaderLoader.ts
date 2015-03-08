/// <reference path="../typed/rx.jquery.d.ts"/>
/// <reference path='./ShaderText.ts'/>

class ShaderLoader {
  getShaderFromServer(name: string): Rx.Observable<ShaderText> {
    return Rx.Observable.combineLatest(this.getFragment(name), this.getVertex(name),
      (frag, vert) => new ShaderText(frag, vert));
  }

  private getVertex(name: string): Rx.Observable<string> {
    return $.getAsObservable<ShaderResponse>('shaders/' + name + ".vert")
      .map((shader) => shader.data );
  }

  private getFragment(name: string): Rx.Observable<string> {
    return $.getAsObservable<ShaderResponse>('shaders/' + name + '.frag')
      .map((shader) => shader.data)
  }
}

interface ShaderResponse {
  data: string;
}
