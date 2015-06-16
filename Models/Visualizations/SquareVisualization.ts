class SquareVisualization extends AudioTextureShaderVisualization {
  static ID="squared";

  constructor(audioSource: AudioSource, resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, controlsProvider?: ControlsProvider) {
    super(audioSource, resolutionProvider, timeSource, shaderLoader, "fft_matrix_product", controlsProvider);
  }
}
