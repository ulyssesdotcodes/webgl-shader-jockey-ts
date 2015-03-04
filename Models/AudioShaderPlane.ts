/// <reference path="../typed/rx.d.ts"/>
/// <reference path="./ShaderPlane.ts"/>
/// <reference path="./UniformsManager.ts"/>

class AudioShaderPlane {
  private _shaderSubject: Rx.Subject<ShaderText>;
  private _meshSubject: Rx.Subject<THREE.Mesh>;
  MeshObservable: Rx.Observable<THREE.Mesh>;

  constructor(audioManager: AudioManager, additionalProperties: Array<IPropertiesProvider>) {
    this._shaderSubject = new Rx.Subject<ShaderText>();
    this._meshSubject = new Rx.Subject<THREE.Mesh>();
    this.MeshObservable = this._meshSubject.asObservable();

    var uniformsManager = UniformsManager.fromPropertyProviders(
      additionalProperties.concat([audioManager]));

    this._shaderSubject
      .map(
      (shaderText) => {
        return new THREE.ShaderMaterial({
            uniforms: uniformsManager.uniforms,
            fragmentShader: shaderText.fragmentShader,
            vertexShader: shaderText.vertextShader
          });
      })
      .map((shader) => new ShaderPlane(shader).mesh)
      .subscribe(this._meshSubject);
  }

  onShaderText(shader: ShaderText) {
    this._shaderSubject.onNext(shader);
  }
}
