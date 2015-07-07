/// <reference path="./IDs"/>
/// <reference path="./ShaderVisualization"/>

class DotsVisualization extends ShaderVisualization {
  static ID = IDs.dots;

  private _audioSource: AudioSource;

  private _eqSegments: IUniform<THREE.Vector4>;
  private _accumulatedLoudness: IUniform<number>;
  private _loudness: IUniform<number>;

  constructor(audioSource: AudioSource, resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, controlsProvider?: ControlsProvider) {
    super(resolutionProvider, timeSource, shaderLoader, "dots");

    this._audioSource = audioSource;
    this.addSources([this._audioSource]);

    this._eqSegments = {
      name: "eqSegments",
      type: "v4",
      value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0)
    };

    this._accumulatedLoudness = {
      name: "accumulatedLoudness",
      type: "f",
      value: 0.0
    };

    this._loudness = {
      name: "loudness",
      type: "f",
      value: 0.0
    };

    this.addUniforms([this._eqSegments, this._accumulatedLoudness, this._loudness]);

    if(controlsProvider) {
      controlsProvider.newControls([]);
    }
  }

  protected setupVisualizerChain(): void {
    super.setupVisualizerChain();
    this.addDisposable(
      this._audioSource.observable()
        .map((e) => AudioUniformFunctions.calculateEqs(e, 4))
        .map((eqs) => new THREE.Vector4(eqs[0], eqs[1], eqs[2], eqs[3]))
        .subscribe((eqs) => this._eqSegments.value = eqs)
      );

    this.addDisposable(
      this._audioSource.observable()
        .map(AudioUniformFunctions.calculateLoudness)
        .subscribe((loudness) => {
        this._loudness.value = loudness;
        this._accumulatedLoudness.value += loudness;
      })
    );
  }

  rendererId(): string {
    return IDs.shader;
  }
}
