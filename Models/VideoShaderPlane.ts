class VideoShaderPlane {
  private _videoManager: VideoManager;
  private _uniformsManager: UniformsManager;

  constructor(videoManager: VideoManager, additionalProperties: Array<IPropertiesProvider>) {
    this._videoManager = videoManager;

    this._uniformsManager = new UniformsManager(additionalProperties.concat([videoManager]))

  }

}
