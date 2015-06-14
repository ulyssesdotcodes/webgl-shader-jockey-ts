class VideoDistortionVisualization extends AudioTextureShaderVisualization {
  static ID = "videoDistortion";
  private _videoSource: VideoSource;

  private _videoUniform: IUniform<THREE.Texture>;

  constructor(videoSource: VideoSource, audioSource: AudioSource, resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader) {
    super(audioSource, resolutionProvider, timeSource, shaderLoader, "video_audio_distortion");

    this.addSources([videoSource]);
    this.addUniforms(videoSource.uniforms());
  }
}
