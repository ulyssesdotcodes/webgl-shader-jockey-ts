/// <reference path="./ShaderVisualization"/>

class AudioTextureShaderVisualization extends ShaderVisualization {
  protected _audioSource: AudioSource;

  private _audioTextureBuffer = new Uint8Array(AudioSource.FFT_SIZE * 4);
  private _audioTextureUniform: IUniform<THREE.DataTexture>;

  constructor(audioSource: AudioSource, resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, shaderUrl: string, controlsProvider?: ControlsProvider) {
    super(resolutionProvider, timeSource, shaderLoader, shaderUrl, controlsProvider);

    this._audioSource = audioSource;
    this.addSources([this._audioSource]);

    var dataTexture = new THREE.DataTexture(
      this._audioTextureBuffer,
      AudioSource.FFT_SIZE,
      1,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
      THREE.UVMapping,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      THREE.LinearFilter,
      THREE.LinearMipMapLinearFilter,
      1);

    this._audioTextureUniform = {
      name: "audioTexture",
      type: "t",
      value: dataTexture
    };

    this.addUniforms([this._audioTextureUniform]);
  }

  protected setupVisualizerChain(): void {
    super.setupVisualizerChain();

    this.addDisposable(
      this._audioSource.observable()
        .subscribe((e) => {
        AudioUniformFunctions.updateAudioBuffer(e, this._audioTextureBuffer);
        this._audioTextureUniform.value.needsUpdate = true;
      })
    );
  }

  object3DObservable(): Rx.Observable<Array<THREE.Mesh>> {
    return super.object3DObservable();
  }
}
