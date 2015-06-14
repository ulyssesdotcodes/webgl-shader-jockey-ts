/// <reference path="./AudioTextureShaderVisualization"/>
/// <reference path="../Sources/TimeSource"/>


class CirclesVisualization extends AudioTextureShaderVisualization {
  static ID = "circles";

  private _accumulatedLoudness: IUniform<number>;

  constructor(audioSource: AudioSource, resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, controlsProvider?: ControlsProvider) {
    super(audioSource, resolutionProvider, timeSource, shaderLoader, "circular_fft");

    this._accumulatedLoudness = {
      name: "accumulatedLoudness",
      type: "f",
      value: 0.0
    };

    if (controlsProvider) {
      this.addUniforms(controlsProvider.uniforms());
    }

    this.addUniforms([this._accumulatedLoudness]);
  }

  protected setupVisualizerChain(): void {
    super.setupVisualizerChain();

    this.addDisposable(
      this._audioSource.observable()
        .map(AudioUniformFunctions.calculateLoudness)
        .subscribe((loudness) => {
        this._accumulatedLoudness.value += loudness;
      })
      );
  }

  meshObservable(): Rx.Observable<Array<THREE.Mesh>> {
    return super.meshObservable();
  }
}
