class SceneUniformController {
  private _resolutionProvider: ResolutionProvider;
  private _timeProvider: TimeProvider;

  private _uniformsManager: UniformsManager;
  SceneUniformsObservable: Rx.Observable<any>;

  controlsProperties: Rx.Observable<IUniform<any>[]>;
  resolutionProperties: Rx.Observable<IUniform<any>[]>;
  timeProperties: Rx.Observable<IUniform<any>[]>;
  videoProperties: Rx.Observable<IUniform<any>[]>;
  audioProperties: Rx.Observable<IUniform<any>[]>;
  loudnessProperties: Rx.Observable<IUniform<any>[]>;

  constructor(audioManager: AudioManager, videoManager: VideoManager,
    controlsProvider: ControlsProvider) {

    this._resolutionProvider = new ResolutionProvider();
    this._timeProvider = new TimeProvider();

    var audioUniformProvider = new AudioUniformProvider(audioManager);

    // Self-contained properties

    this.controlsProperties = controlsProvider.glProperties();
    this.resolutionProperties = this._resolutionProvider.glProperties();
    this.timeProperties = this._timeProvider.glProperties();
    this.videoProperties = videoManager.glProperties();
    this.audioProperties = audioUniformProvider.glProperties();

    // Properties that depend on other properties
    var loudnessAccumulator = new LoudnessAccumulator(audioManager);
    this.controlsProperties
      .flatMap(Rx.Observable.from)
      .filter((uniform: IUniform<any>) => uniform.name == "volume")
      .subscribe(
        (volumeUniform: IUniform<number>) => loudnessAccumulator.setVolumeUniform(volumeUniform));
    this.loudnessProperties = loudnessAccumulator.glProperties();

    var propertiesObservable = Rx.Observable.combineLatest([
      this.controlsProperties,
      this.resolutionProperties,
      this.timeProperties,
      this.videoProperties,
      this.audioProperties,
      this.loudnessProperties],
      [].concat);

    this._uniformsManager = new UniformsManager(propertiesObservable);

    this.SceneUniformsObservable = this._uniformsManager.UniformsObservable;
  }

  onNewResolution(resolution) {
    this._resolutionProvider.updateResolution(
      new THREE.Vector2(resolution.width, resolution.height));
  }

  update() {
    this._timeProvider.updateTime();
  }
}
