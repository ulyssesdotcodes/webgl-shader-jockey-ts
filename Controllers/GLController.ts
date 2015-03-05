/// <reference path='../typed/three.d.ts'/>
/// <reference path='../Models/IPropertiesProvider.ts'/>
/// <reference path='../Models/UniformsManager.ts'/>
/// <reference path='../Models/AudioShaderPlane.ts'/>
/// <reference path='../Models/ShaderLoader.ts'/>
/// <reference path='../Models/ResolutionProvider.ts'/>

class GLController {
  private _uniformsManager: UniformsManager;
  private _meshSubject: Rx.Subject<Array<THREE.Mesh>>;
  MeshObservable: Rx.Observable<Array<THREE.Mesh>>;
  private _shaderLoader: ShaderLoader;
  private _audioShaderPlane: AudioShaderPlane;
  private _resolutionProvider: ResolutionProvider;

  constructor(audioManager: AudioManager) {
    this._uniformsManager = new UniformsManager([<IPropertiesProvider>audioManager]);

    this._meshSubject = new Rx.Subject<Array<THREE.Mesh>>();
    this.MeshObservable = this._meshSubject.asObservable();

    this._resolutionProvider = new ResolutionProvider();

    this._shaderLoader = new ShaderLoader();
    this._audioShaderPlane = new AudioShaderPlane(audioManager, [this._resolutionProvider]);
    this._audioShaderPlane.MeshObservable.subscribe((mesh) => this.onNewMeshes([mesh]));
  }

  static fromAudioManager(audioManager: AudioManager) {
    var controller = new GLController(audioManager);
  }

  onNewResolution(resolution) {
    this._resolutionProvider.updateResolution(
      new THREE.Vector2(resolution.width, resolution.height));
  }

  onNewMeshes(meshes: Array<THREE.Mesh>) {
    this._meshSubject.onNext(meshes);
  }

  onShaderName(name: string) {
    this._shaderLoader.getShaderFromServer("simple")
      .subscribe(shader => this._audioShaderPlane.onShaderText(shader))
  }
}
