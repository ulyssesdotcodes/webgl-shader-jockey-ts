/// <reference path='../typed/three.d.ts'/>
/// <reference path='../Models/IPropertiesProvider.ts'/>
/// <reference path='../Models/PropertiesShaderPlane.ts'/>
/// <reference path='../Models/ShaderLoader.ts'/>
/// <reference path='../Models/ResolutionProvider.ts'/>
/// <reference path='../Models/TimeProvider.ts'/>

class GLController {
  private _meshSubject: Rx.Subject<Array<THREE.Mesh>>;
  MeshObservable: Rx.Observable<Array<THREE.Mesh>>;
  private _shaderLoader: ShaderLoader;
  private _audioShaderPlane: PropertiesShaderPlane;
  private _resolutionProvider: ResolutionProvider;
  private _timeProvider: TimeProvider;

  constructor(audioManager: AudioManager, videoManager: VideoManager) {
    this._meshSubject = new Rx.Subject<Array<THREE.Mesh>>();
    this.MeshObservable = this._meshSubject.asObservable();

    this._resolutionProvider = new ResolutionProvider();
    this._timeProvider = new TimeProvider();

    this._shaderLoader = new ShaderLoader();
    this._audioShaderPlane = new PropertiesShaderPlane([videoManager,
      this._resolutionProvider, this._timeProvider, audioManager]);
    this._audioShaderPlane.MeshObservable.subscribe((mesh) => this.onNewMeshes([mesh]));
  }

  onNewResolution(resolution) {
    this._resolutionProvider.updateResolution(
      new THREE.Vector2(resolution.width, resolution.height));
  }

  onNewMeshes(meshes: Array<THREE.Mesh>) {
    this._meshSubject.onNext(meshes);
  }

  onShaderName(name: string) {
    this._shaderLoader.getShaderFromServer(name)
      .subscribe(shader => this._audioShaderPlane.onShaderText(shader))
  }

  update() {
    this._timeProvider.updateTime();
  }
}
