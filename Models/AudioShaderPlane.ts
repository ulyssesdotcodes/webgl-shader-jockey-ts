/// <reference path="../typed/rx.d.ts"/>
/// <reference path="./ShaderPlane.ts"/>
/// <reference path="./UniformsManager.ts"/>

class AudioShaderPlane {
  private _shaderSubject: Rx.Subject<ShaderText>;
  private _meshSubject: Rx.Subject<THREE.Mesh>;
  private _uniformsManager: UniformsManager;
  MeshObservable: Rx.Observable<THREE.Mesh>;

  constructor(audioManager: AudioManager, additionalProperties: Array<IPropertiesProvider>) {
    this._shaderSubject = new Rx.Subject<ShaderText>();
    this._meshSubject = new Rx.Subject<THREE.Mesh>();
    this.MeshObservable = this._meshSubject.asObservable();

    this._uniformsManager = new UniformsManager(additionalProperties.concat([audioManager]));

    Rx.Observable.combineLatest(this._shaderSubject, this._uniformsManager.UniformsObservable,
      (shaderText, uniforms) => new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: shaderText.fragmentShader,
            vertexShader: shaderText.vertextShader
          })
      )
      .map((shader) => new ShaderPlane(shader).mesh)
      .subscribe(this._meshSubject);
  }

  onShaderText(shader: ShaderText) {
    /* Calculate the uniforms after it's subscribed to*/
    this._uniformsManager.calculateUniforms();
    this._shaderSubject.onNext(shader);
  }
}
