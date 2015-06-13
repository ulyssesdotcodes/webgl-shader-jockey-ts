/// <reference path="./BaseVisualization"/>
/// <reference path="./SimpleVisualization"/>
/// <reference path="./DotsVisualization"/>
/// <reference path="./CirclesVisualization"/>

class VisualizationManager {
  private _visualizationSubject: Rx.BehaviorSubject<BaseVisualization>;

  private _shaderLoader: ShaderLoader;

  private _audioSource: AudioSource;
  private _timeSource: TimeSource;

  private _resolutionProvider: ResolutionProvider;

  constructor(audioSource: AudioSource, resolutionProvider: ResolutionProvider, shaderBaseUrl: string) {
    this._visualizationSubject = new Rx.BehaviorSubject(null);

    this._shaderLoader = new ShaderLoader("no_controls.frag", "util.frag", shaderBaseUrl);

    this._audioSource =audioSource;
    this._timeSource = new TimeSource();
    this._resolutionProvider = resolutionProvider;
  }

  meshObservable(optionObservable: Rx.Observable<VisualizationOption>): Rx.Observable<Array<THREE.Mesh>> {
    optionObservable.subscribe((__) => {
      if(this._visualizationSubject.getValue() != null) {
        this._visualizationSubject.getValue().unsubscribe();
      }
    });

    optionObservable
      .filter((visualization) => visualization.id == SimpleVisualization.ID)
      .map((visualizationOption) => visualizationOption.options)
      .map((options) => new SimpleVisualization(this._audioSource, this._resolutionProvider, this._timeSource, options, this._shaderLoader))
      .subscribe(this._visualizationSubject);

    optionObservable
      .filter((visualization) => visualization.id == DotsVisualization.ID)
      .map((__) => new DotsVisualization(this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader))
      .subscribe(this._visualizationSubject);

    optionObservable
      .filter((visualization) => visualization.id == CirclesVisualization.ID)
      .map((__) => new CirclesVisualization(this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader))
      .subscribe(this._visualizationSubject);

    return this._visualizationSubject.asObservable().filter(vis => vis != null).flatMap((visualization) => visualization.meshObservable());
  }

  animate(): void {
    this._visualizationSubject.getValue().animate();
  }
}
