/// <reference path="../typed/rx.jquery.d.ts"/>
/// <reference path='./ShaderText.ts'/>

class ShaderLoader {
  private _shadersUrl: string;

  private _regularVert: string;

  private _utilsUrl: string
  private _utilFrag: string;

  private _initialMethodsUrl: string;
  private _initialMethodsFrag: string;

  constructor(initialMethodsUrl: string, utilsUrl: string, shadersUrl: string) {
    this._shadersUrl = shadersUrl;
    this._initialMethodsUrl = shadersUrl + initialMethodsUrl;
    this._utilsUrl = shadersUrl + utilsUrl;
    this.getVertex("plane").subscribe((vert) => this._regularVert = vert);
  }

  getShaderFromServer(url: string): Rx.Observable<ShaderText> {
    return Rx.Observable.zip(this.getFragment(url), this.getVertex(url),
      (frag, vert) => new ShaderText(frag, vert));
  }

  private getVertex(url: string): Rx.Observable<string> {
    return $.getAsObservable<ShaderResponse>(this._shadersUrl + url + ".vert")
      .map((shader) => shader.data )
      .onErrorResumeNext(Rx.Observable.just(this._regularVert));
  }

  private getFragment(url: string): Rx.Observable<string> {
    return $.getAsObservable<ShaderResponse>(this._shadersUrl + url + '.frag')
      .map((shader) => shader.data)
      .combineLatest(this.utilFrag(), this.initialMethodsFrag(), (frag, im, util) => util.concat(im).concat(frag));
  }

  private utilFrag(): Rx.Observable<string> {
    if(this._utilFrag === undefined) {
      return $.getAsObservable<ShaderResponse>(this._utilsUrl)
        .map((shader) => shader.data)
        .doOnNext((util) => this._utilFrag = util);
    }

    return Rx.Observable.just(this._utilFrag);
  }

  private initialMethodsFrag(): Rx.Observable<string> {
    if(this._initialMethodsFrag === undefined) {
      return $.getAsObservable<ShaderResponse>(this._initialMethodsUrl)
        .map((shader) => shader.data)
        .doOnNext((util) => this._initialMethodsFrag = util);
    }

    return Rx.Observable.just(this._initialMethodsFrag);
  }
}

interface ShaderResponse {
  data: string;
}
