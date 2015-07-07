/// <reference path="../Sources/VideoSource"/>

class VideoDistortionVisualization extends AudioTextureShaderVisualization {
  static ID = "videoDistortion";
  private _videoSource: VideoSource;

  private _videoUniform: IUniform<THREE.Texture>;

  constructor(videoSource: VideoSource, audioSource: AudioSource, resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, controlsProvider?: ControlsProvider) {
    super(audioSource, resolutionProvider, timeSource, shaderLoader, "video_audio_distortion");

    this.addSources([videoSource]);

    this.addUniforms(videoSource.uniforms());

    if(controlsProvider) {
      controlsProvider.newControls([Controls.volume, Controls.hue]);
      this.addUniforms(controlsProvider.uniforms());
    }
  }
}
