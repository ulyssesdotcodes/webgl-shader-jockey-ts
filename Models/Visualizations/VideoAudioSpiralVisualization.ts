/// <reference path="../Sources/VideoSource"/>
/// <reference path="../Controls"/>

class VideoAudioSpiralVisualization extends AudioTextureShaderVisualization {
  static ID = "videoAudioSpiral";
  private _videoSource: VideoSource;

  private _loudness: IUniform<number>;
  private _videoUniform: IUniform<THREE.Texture>;

  constructor(videoSource: VideoSource, audioSource: AudioSource, resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, controlsProvider?: ControlsProvider) {
    super(audioSource, resolutionProvider, timeSource, shaderLoader, "video_audio_spiral");

    this.addSources([videoSource]);

    this.addUniforms(videoSource.uniforms());

    this._loudness = {
      name: "loudness",
      type: "f",
      value: 0.0
    };

    this.addUniforms([this._loudness]);

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
        this._loudness.value = loudness;
      })
    );
  }
}
