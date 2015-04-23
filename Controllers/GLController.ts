/// <reference path='../typed/three.d.ts'/>
/// <reference path='../Models/IPropertiesProvider.ts'/>
/// <reference path='../Models/PropertiesShaderPlane.ts'/>
/// <reference path='../Models/ShaderLoader.ts'/>
/// <reference path='../Models/ResolutionProvider.ts'/>
/// <reference path='../Models/TimeProvider.ts'/>
/// <reference path='../Models/AudioUniformProvider.ts'/>
/// <reference path='../Models/LoudnessAccumulator.ts'/>
/// <reference path='../Controllers/SceneUniformController.ts'/>

class GLController {
  private _meshSubject: Rx.Subject<Array<THREE.Mesh>>;
  MeshObservable: Rx.Observable<Array<THREE.Mesh>>;
  private _shaderLoader: ShaderLoader;
  private _audioShaderPlane: PropertiesShaderPlane;

  constructor(uniformController: SceneUniformController) {
    this._meshSubject = new Rx.Subject<Array<THREE.Mesh>>();
    this.MeshObservable = this._meshSubject.asObservable();

    this._shaderLoader = new ShaderLoader();

    this._audioShaderPlane = new PropertiesShaderPlane(uniformController.ScenePropertiesObservable);
    this._audioShaderPlane.MeshObservable.subscribe((mesh) => this.onNewMeshes([mesh]));
  }

  onNewMeshes(meshes: Array<THREE.Mesh>) {
    this._meshSubject.onNext(meshes);
  }

  onShaderName(name: string) {
    this._shaderLoader.getShaderFromServer(name)
      .subscribe(shader => this._audioShaderPlane.onShaderText(shader))
  }
}
