/// <reference path='../typed/three.d.ts'/>
/// <reference path="../Models/Sources/UniformProvider"/>
/// <reference path='../Models/PropertiesShaderPlane.ts'/>
/// <reference path='../Models/ShaderLoader.ts'/>
/// <reference path='../Models/Sources/ResolutionProvider.ts'/>
/// <reference path="../Models/Sources/TimeSource"/>
/// <reference path='../Models/Sources/AudioUniformProvider.ts'/>
/// <reference path='../Models/LoudnessAccumulator.ts'/>
/// <reference path="../Models/Visualizations/VisualizationManager"/>

class GLController {
  private _meshSubject: Rx.BehaviorSubject<Array<THREE.Mesh>>;
  MeshObservable: Rx.Observable<Array<THREE.Mesh>>;
  private _audioShaderPlane: PropertiesShaderPlane;
  private _resolutionProvider: ResolutionProvider;
  private _shadersUrl: string;

  private _visualizationManager: VisualizationManager;

  constructor(visualizationManager: VisualizationManager, visualizationOptionObservable: Rx.Observable<VisualizationOption>, resolutionProvider: ResolutionProvider) {
    this._meshSubject = new Rx.BehaviorSubject<Array<THREE.Mesh>>([]);
    this.MeshObservable = this._meshSubject.asObservable();
    //
    // this._resolutionProvider = new ResolutionProvider();
    // this._timeProvider = new TimeProvider();

    // this._shadersUrl = shadersUrl;
    // this._shaderLoader = new ShaderLoader(
    //   controlsProvider == null ? 'no_controls.frag' : 'controls_init.frag', 'util.frag' , shadersUrl);

    // var audioUniformProvider = new AudioUniformProvider(audioManager);
    //
    // var loudnessAccumulator = new LoudnessAccumulator(audioManager);
    //
    // var properties: Array<IPropertiesProvider<any>> = [
    //   this._resolutionProvider, this._timeProvider,
    //   audioUniformProvider, loudnessAccumulator
    // ];
    //
    // if (videoManager != null) {
    //   properties.push(videoManager);
    // }
    //
    // if (controlsProvider != null) {
    //   controlsProvider.glProperties()
    //     .flatMap(Rx.Observable.from)
    //     .filter((uniform: IUniform<any>) => uniform.name == "volume")
    //     .subscribe(
    //     (volumeUniform: IUniform<number>) => loudnessAccumulator.setVolumeUniform(volumeUniform));
    //
    //   properties.push(controlsProvider);
    // }

    // this._audioShaderPlane = new PropertiesShaderPlane(properties);
    //
    // this._audioShaderPlane.MeshObservable.subscribe((mesh) => this.onNewMeshes([mesh]));

    this._resolutionProvider = resolutionProvider;
    this._visualizationManager = visualizationManager;
    this._visualizationManager.meshObservable(visualizationOptionObservable)
      .subscribe((meshes) => {
        this._meshSubject.onNext(meshes);
      })
  }

  onNewResolution(resolution) {
    this._resolutionProvider.updateResolution(
      new THREE.Vector2(resolution.width, resolution.height));
  }
}
