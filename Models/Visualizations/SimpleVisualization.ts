/// <reference path="./AudioTextureShaderVisualization"/>

class SimpleVisualization extends AudioTextureShaderVisualization {
  static ID = "simple";

  constructor(audiosource: AudioSource, resolutionprovider: ResolutionProvider, timesource: TimeSource, options: any, shaderloader: ShaderLoader) {
    super(audiosource, resolutionprovider, timesource, shaderloader, "simple");


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

  meshobservable(): Rx.Observable<Array<THREE.Mesh>> {
    return super.meshObservable();
  }
}
