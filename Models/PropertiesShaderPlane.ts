/// <reference path="../typed/rx.d.ts"/>
/// <reference path="./ShaderPlane.ts"/>
/// <reference path="./UniformsManager.ts"/>

class PropertiesShaderPlane {
  private _shaderSubject: Rx.Subject<ShaderText>;
  private _meshSubject: Rx.Subject<THREE.Mesh>;
  private _uniformsManager: UniformsManager;
  MeshObservable: Rx.Observable<THREE.Mesh>;

  constructor(glProperties: Array<UniformProvider<any>>) {
    this._shaderSubject = new Rx.Subject<ShaderText>();
    this._meshSubject = new Rx.Subject<THREE.Mesh>();
    this.MeshObservable = this._meshSubject.asObservable();

    this._uniformsManager = new UniformsManager(glProperties);

    Rx.Observable.combineLatest(this._shaderSubject, this._uniformsManager.UniformsObservable,
      (shaderText, uniforms) => new ShaderPlane(shaderText, uniforms).mesh)
      .subscribe(this._meshSubject);
  }

  onShaderText(shader: ShaderText) {
    /* Calculate the uniforms after it's subscribed to*/
    this._shaderSubject.onNext(shader);
    this._uniformsManager.calculateUniforms();
  }
}
