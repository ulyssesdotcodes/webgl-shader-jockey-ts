/// <reference path="../typed/rx.jquery.d.ts"/>
/// <reference path='./ShaderText.ts'/>

class ShaderLoader {
  private _regularVert: string;

  constructor() {
    this.getVertex("plane").subscribe((vert) => this._regularVert = vert);
  }

  getShaderFromServer(name: string): Rx.Observable<ShaderText> {
    return Rx.Observable.combineLatest(this.getFragment(name), this.getVertex(name),
      (frag, vert) => new ShaderText(frag, vert));
  }

  private getVertex(name: string): Rx.Observable<string> {
    return $.getAsObservable<ShaderResponse>('shaders/' + name + ".vert")
      .map((shader) => shader.data )
      .onErrorResumeNext(Rx.Observable.just(this._regularVert));
  }

  private getFragment(name: string): Rx.Observable<string> {
    return $.getAsObservable<ShaderResponse>('shaders/' + name + '.frag')
      .map((shader) => shader.data);
  }
}

interface ShaderResponse {
  data: string;
}
