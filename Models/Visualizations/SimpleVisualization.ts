/// <reference path="./AudioTextureShaderVisualization"/>

class SimpleVisualization extends AudioTextureShaderVisualization {
  static ID = "simple";

  constructor(audioSource: AudioSource, resolutionProvider: ResolutionProvider, timeSource: TimeSource, options: any, shaderLoader: ShaderLoader) {
    super(audioSource, resolutionProvider, timeSource, shaderLoader, "simple");


    var colorUniform = {
      name: "color",
      type: "v3",
      value: options && options.color || new THREE.Vector3(1.0, 1.0, 1.0)
    };

    this.addUniforms([colorUniform]);
  }

  protected setupVisualizerChain(): void {
    super.setupVisualizerChain();
  }

  meshObservable(): Rx.Observable<Array<THREE.Mesh>> {
    return super.meshObservable();
  }
}
