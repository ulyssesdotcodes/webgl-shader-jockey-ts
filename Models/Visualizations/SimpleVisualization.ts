/// <reference path="./AudioTextureShaderVisualization"/>

class SimpleVisualization extends AudioTextureShaderVisualization {
  static ID = "simple";

  constructor(audiosource: AudioSource, resolutionprovider: ResolutionProvider, timesource: TimeSource, options: any, shaderloader: ShaderLoader, controlsProvider?: ControlsProvider) {
    super(audiosource, resolutionprovider, timesource, shaderloader, "simple", controlsProvider);


    var coloruniform = {
      name: "color",
      type: "v3",
      value: options && options.color || new THREE.Vector3(1.0, 1.0, 1.0)
    };

    this.addUniforms([coloruniform]);
  }

  protected setupvisualizerchain(): void {
    super.setupVisualizerChain();
  }

  object3DObservable(): Rx.Observable<Array<THREE.Mesh>> {
    return super.object3DObservable();
  }

  rendererId(): string{
    return IDs.shader;
  }
}
