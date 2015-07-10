/// <reference path="../typed/rx.jquery.d.ts"/>
/// <reference path='./ShaderText.ts'/>

class ShaderLoader {
  private _shadersUrl: string;

  private _regularVert: string;

  private _utilsUrl: string
  private _utilFrag: string;

  private _initialMethodsUrl: string;
  private _initialMethodsFrag: string;

  constructor(utilsUrl: string, shadersUrl: string) {
    this._shadersUrl = shadersUrl;
    this._utilsUrl = shadersUrl + utilsUrl;
  }

  getVariedShaderFromServer(fragmentUrl: string, vertexUrl: string): Rx.Observable<ShaderText> {
    return Rx.Observable.zip(this.getFragment(fragmentUrl), this.getVertex(vertexUrl),
      (frag, vert) => new ShaderText(frag, vert));
  }

  getShaderFromServer(url: string): Rx.Observable<ShaderText> {
    return Rx.Observable.zip(this.getFragment(url), this.getVertex(url),
      (frag, vert) => new ShaderText(frag, vert));
  }

  private getVertex(url: string): Rx.Observable<string> {
    return $.getAsObservable<ShaderResponse>(this._shadersUrl + url + ".vert")
      .map((shader) => shader.data)
      .onErrorResumeNext(this.getPlane());
  }

  private getFragment(url: string): Rx.Observable<string> {
    return $.getAsObservable<ShaderResponse>(this._shadersUrl + url + '.frag')
      .map((shader) => shader.data)
      .combineLatest(this.utilFrag(), (frag, util) => util.concat(frag));
  }

  private getPlane(): Rx.Observable<string> {
    if (this._regularVert) {
      return Rx.Observable.just(this._regularVert);
    }

    return $.getAsObservable<ShaderResponse>(this._shadersUrl + "plane.vert")
      .map((shader) => shader.data)
      .doOnNext((vert) => {
      this._regularVert = vert
    });
  }

  private utilFrag(): Rx.Observable<string> {
    if (this._utilFrag === undefined) {
      return $.getAsObservable<ShaderResponse>(this._utilsUrl)
        .map((shader) => shader.data)
        .doOnNext((util) => this._utilFrag = util);
    }

    return Rx.Observable.just(this._utilFrag);
  }
}

interface ShaderResponse {
  data: string;
}
