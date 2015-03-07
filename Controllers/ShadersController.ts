class ShadersController {
  private _shaderNameSubject: Rx.Subject<string>;
  ShaderNameObservable: Rx.Observable<string>;

  constructor() {
    this._shaderNameSubject = new Rx.Subject<string>();
    this.ShaderNameObservable = this._shaderNameSubject.asObservable();
  }

  onShaderName(shaderName: string): void {
    this._shaderNameSubject.onNext(shaderName);
  }
}
