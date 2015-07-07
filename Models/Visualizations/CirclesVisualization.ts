/// <reference path="./AudioTextureShaderVisualization"/>
/// <reference path="../Sources/TimeSource"/>


class CirclesVisualization extends AudioTextureShaderVisualization {
  private _accumulatedLoudness: IUniform<number>;

  constructor(audioSource: AudioSource, resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, controlsProvider?: ControlsProvider) {
    super(audioSource, resolutionProvider, timeSource, shaderLoader, "circular_fft", controlsProvider);

    this._accumulatedLoudness = {
      name: "accumulatedLoudness",
      type: "f",
      value: 0.0
    };

    this.addUniforms([this._accumulatedLoudness]);

    if(controlsProvider) {
      controlsProvider.newControls([Controls.volume, Controls.hue]);
      this.addUniforms(controlsProvider.uniforms());
    }
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

  object3DObservable(): Rx.Observable<Array<THREE.Mesh>> {
    return super.object3DObservable();
  }

  rendererId() {
    return IDs.shader;
  }
}
