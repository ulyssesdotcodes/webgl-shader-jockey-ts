class GLController {
  private _uniformsManager: UniformsManager;
  private _meshSubject: Rx.Subject<Array<THREE.Mesh>>;
  MeshObservable: Rx.Observable<Array<THREE.Mesh>>;

  constructor(audioManager: AudioManager) {
    this._uniformsManager = UniformsManager.fromPropertyProviders([<IPropertiesProvider>audioManager]);

    this._meshSubject = new Rx.Subject<Array<THREE.Mesh>>();
    this.MeshObservable = this._meshSubject.asObservable();
  }

  onNewMeshes(meshes: Array<THREE.Mesh>) {
    this._meshSubject.onNext(meshes);
  }

  fromAudioManager(audioManager: AudioManager) {
    var controller = new GLController(audioManager);
    var audioShaderPlane = new AudioShaderPlane(audioManager);
    audioShaderPlane.MeshObservable.subscribe((mesh) => controller.onNewMeshes([mesh]));
  }
}
