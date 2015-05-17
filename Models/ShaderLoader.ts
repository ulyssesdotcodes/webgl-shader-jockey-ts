/// <reference path="../typed/rx.jquery.d.ts"/>
/// <reference path='./ShaderText.ts'/>

class ShaderLoader {
  private _regularVert: string;
  private _utilFrag: string;

  private _initialMethodsUrl: string;
  private _initialMethodsFrag: string;

  constructor(initialMethodsUrl: string) {
    this._initialMethodsUrl = initialMethodsUrl;
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
      .map((shader) => shader.data)
      .combineLatest(this.utilFrag(), this.initialMethodsFrag(), (frag, im, util) => util.concat(im).concat(frag));
  }

  private utilFrag(): Rx.Observable<string> {
    if(this._utilFrag === undefined) {
      return $.getAsObservable<ShaderResponse>('shaders/util.frag')
        .map((shader) => shader.data)
        .doOnNext((util) => this._utilFrag = util);
    }

    return Rx.Observable.just(this._utilFrag);
  }

  private initialMethodsFrag(): Rx.Observable<string> {
    if(this._initialMethodsFrag === undefined) {
      return $.getAsObservable<ShaderResponse>('shaders/' + this._initialMethodsUrl)
        .map((shader) => shader.data)
        .doOnNext((util) => this._initialMethodsFrag = util);
    }

    return Rx.Observable.just(this._initialMethodsFrag);
  }
}

interface ShaderResponse {
  data: string;
}
