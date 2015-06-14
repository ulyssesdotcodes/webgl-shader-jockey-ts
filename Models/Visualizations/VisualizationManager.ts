/// <reference path="./BaseVisualization"/>
/// <reference path="./SimpleVisualization"/>
/// <reference path="./DotsVisualization"/>
/// <reference path="./CirclesVisualization"/>
/// <reference path="./VideoDistortionVisualization"/>

class VisualizationManager {
  private _visualizationSubject: Rx.BehaviorSubject<BaseVisualization>;

  private _shaderLoader: ShaderLoader;

  private _videoSource: VideoSource;
  private _audioSource: AudioSource;
  private _timeSource: TimeSource;

  private _resolutionProvider: ResolutionProvider;
  private _controlsProvider: ControlsProvider;

  constructor(videoSource: VideoSource, audioSource: AudioSource, resolutionProvider: ResolutionProvider, shaderBaseUrl: string, controlsProvider?: ControlsProvider) {
    this._visualizationSubject = new Rx.BehaviorSubject(null);

    this._shaderLoader = new ShaderLoader(controlsProvider ? "controls.frag" : "no_controls.frag", "util.frag", shaderBaseUrl);

    this._audioSource = audioSource;
    this._videoSource = videoSource;
    this._timeSource = new TimeSource();
    this._resolutionProvider = resolutionProvider;
    this._controlsProvider = controlsProvider;
  }

  meshObservable(optionObservable: Rx.Observable<VisualizationOption>): Rx.Observable<Array<THREE.Mesh>> {
    optionObservable.subscribe((__) => {
      if (this._visualizationSubject.getValue() != null) {
        this._visualizationSubject.getValue().unsubscribe();
      }
    });

    this.addVisualization(optionObservable, SimpleVisualization.ID,
      (options) => new SimpleVisualization(this._audioSource, this._resolutionProvider, this._timeSource, options, this._shaderLoader, this._controlsProvider));

    this.addVisualization(optionObservable, DotsVisualization.ID,
      (options) => new DotsVisualization(this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader, this._controlsProvider));

    this.addVisualization(optionObservable, CirclesVisualization.ID,
      (options) => new CirclesVisualization(this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader, this._controlsProvider));

    this.addVisualization(optionObservable, VideoDistortionVisualization.ID,
      (options) => new VideoDistortionVisualization(this._videoSource, this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader, this._controlsProvider));

    return this._visualizationSubject.asObservable().filter(vis => vis != null).flatMap((visualization) => visualization.meshObservable());
  }

  addVisualization(optionObservable: Rx.Observable<VisualizationOption>, id: string,
    f: (options?: Array<any>) => BaseVisualization) {
    optionObservable
      .filter((visualization) => visualization.id == id)
      .map((visualizationOption) => visualizationOption.options)
      .map((options) => f.call(this, options))
      .subscribe(this._visualizationSubject);
  }

  animate(): void {
    this._visualizationSubject.getValue().animate();
  }
}
