class ShadersController {
  private _shaders: Array<Shader>;
  private _shaderUrlSubject: Rx.Subject<string>;
  ShaderUrlObservable: Rx.Observable<string>;

  constructor(shaders: Array<Shader>) {
    this._shaders = shaders;
    this._shaderUrlSubject = new Rx.Subject<string>();
    this.ShaderUrlObservable = this._shaderUrlSubject.asObservable();
  }

  shaderNames() {
    var shaderNames: Array<string> = [];
    this._shaders.forEach((shader) => shaderNames.push(shader.name));
    return shaderNames;
  }

  onShaderName(shaderName: string): void {
    var shaderUrl: string;
    this._shaders.forEach((shader) => {
      if (shader.name == shaderName) {
        shaderUrl = shader.url;
      }
    });
    if (shaderUrl != undefined) {
      this._shaderUrlSubject.onNext(shaderUrl);
    }
  }
}
