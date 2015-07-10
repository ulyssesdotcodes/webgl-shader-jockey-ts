/// <reference path="./BaseVisualization"/>
/// <reference path="./SimpleVisualization"/>
/// <reference path="./DotsVisualization"/>
/// <reference path="./CirclesVisualization"/>
/// <reference path="./VideoDistortionVisualization"/>
/// <reference path="./VideoAudioSpiralVisualization"/>
/// <reference path="./SquareVisualization"/>
/// <reference path="./EqPointCloud"/>
/// <reference path="./FlockingVisualization"/>

class VisualizationManager {
  private _visualizationSubject: Rx.BehaviorSubject<BaseVisualization>;

  private _shaderLoader: ShaderLoader;

  private _videoSource: VideoSource;
  private _audioSource: AudioSource;
  private _timeSource: TimeSource;

  private _resolutionProvider: ResolutionProvider;
  private _controlsProvider: ControlsProvider;

  private _renderer: THREE.WebGLRenderer;

  private _visualizations: any;

  constructor(renderer: THREE.WebGLRenderer, videoSource: VideoSource, audioSource: AudioSource, resolutionProvider: ResolutionProvider, shaderBaseUrl: string, controlsProvider?: ControlsProvider) {
    this._visualizationSubject = new Rx.BehaviorSubject(null);
    this._visualizations = [];

    this._renderer = renderer;

    this._shaderLoader = new ShaderLoader("util.frag", shaderBaseUrl);

    this._audioSource = audioSource;
    this._videoSource = videoSource;
    this._timeSource = new TimeSource();
    this._resolutionProvider = resolutionProvider;
    this._controlsProvider = controlsProvider;
  }

  meshObservable(optionObservable: Rx.Observable<VisualizationOption>): Rx.Observable<Array<THREE.Object3D>> {
    optionObservable.subscribe((__) => {
      if (this._visualizationSubject.getValue() != null) {
        this._visualizationSubject.getValue().unsubscribe();
      }
    });

    this.addVisualization(optionObservable, SimpleVisualization.ID,
      (options) => new SimpleVisualization(this._audioSource, this._resolutionProvider, this._timeSource, options, this._shaderLoader, this._controlsProvider));

    this.addVisualization(optionObservable, IDs.dots,
      (options) => new DotsVisualization(this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader, this._controlsProvider));

    this.addVisualization(optionObservable, IDs.circles,
      (options) => new CirclesVisualization(this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader, this._controlsProvider));

    this.addVisualization(optionObservable, VideoDistortionVisualization.ID,
      (options) => new VideoDistortionVisualization(this._videoSource, this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader, this._controlsProvider));

    this.addVisualization(optionObservable, VideoAudioSpiralVisualization.ID,
      (options) => new VideoAudioSpiralVisualization(this._videoSource, this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader, this._controlsProvider));

    this.addVisualization(optionObservable, SquareVisualization.ID,
      (options) => new SquareVisualization(this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader, this._controlsProvider));

    this.addVisualization(optionObservable, EqPointCloud.ID,
      (options) => new EqPointCloud(this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader, this._controlsProvider));

    this.addVisualization(optionObservable, FlockingVisualization.ID,
      (options) => new FlockingVisualization(this._renderer, this._audioSource, this._resolutionProvider, this._timeSource, this._shaderLoader, this._controlsProvider));

    return this._visualizationSubject.asObservable().filter(vis => vis != null).flatMap((visualization) => visualization.object3DObservable());
  }

  observableSubject(): Rx.Observable<any> {
    return this._visualizationSubject.asObservable()
      .flatMap((vis) => vis.object3DObservable()
          .map((newVis) => {
            return { type: vis.rendererId(), objects: newVis };
          }));
  }

  addVisualization(optionObservable: Rx.Observable<VisualizationOption>, id: string,
    f: (options?: Array<any>) => BaseVisualization) {
    optionObservable
      .filter((visualization) => visualization.id == id)
      .map((visOpt) => {
        if(!this._visualizations[visOpt.id]) {
          this._visualizations[visOpt.id] = f(visOpt.options);
        }
        return this._visualizations[visOpt.id];
      })
      .map((visualizationOption) => visualizationOption.options)
      .map((options) => f.call(this, options))
      .subscribe(this._visualizationSubject);
  }

  animate(): any {
    return this._visualizationSubject.getValue().animate();
  }
}
