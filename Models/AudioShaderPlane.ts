/// <reference path="../typed/rx.d.ts"/>
/// <reference path="./ShaderPlane.ts"/>
/// <reference path="./UniformsManager.ts"/>

class AudioShaderPlane {
  private _shaderSubject: Rx.Subject<THREE.ShaderMaterial>;
  private _meshSubject: Rx.Subject<THREE.Mesh>;
  MeshObservable: Rx.Observable<THREE.Mesh>;

  constructor(audioManager: AudioManager) {
    this._shaderSubject = new Rx.Subject<THREE.ShaderMaterial>();
    this._meshSubject = new Rx.Subject<THREE.Mesh>();
    this.MeshObservable = this._meshSubject.asObservable();

    var uniformsManager = UniformsManager.fromPropertyProviders([audioManager]);

    this._shaderSubject
      .map(
      (shader) => {
        shader.uniforms = uniformsManager.uniforms;
        return shader;
      })
      .map((shader) => new ShaderPlane(shader).mesh)
      .subscribe(this._meshSubject);
  }

  onShader(shader: THREE.ShaderMaterial) {
    this._shaderSubject.onNext(shader);
  }
} 