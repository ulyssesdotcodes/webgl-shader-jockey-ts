/// <reference path="../Attribute"/>

class PointCloudVisualization extends BaseVisualization {
  protected _timeSource: TimeSource;
  private _resolutionProvider: ResolutionProvider;

  protected _uniforms: Array<IUniform<any>>;
  protected _attributes: Array<Attribute<any>>;

  protected _timeUniform: IUniform<number>;

  protected _shaderLoader: ShaderLoader;
  private _shaderUrl: string;

  constructor(resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, shaderurl: string, controlsProvider?: ControlsProvider) {
    super();

    this._shaderLoader = shaderLoader;
    this._shaderUrl = shaderurl;

    this._timeSource = timeSource;
    this.addSources([this._timeSource]);

    this._resolutionProvider = resolutionProvider;

    this._timeUniform = {
      name: "time",
      type: "f",
      value: 0.0
    };

    this._uniforms = [<IUniform<any>> this._timeUniform].concat(resolutionProvider.uniforms());
    this._attributes = [];
  }

  protected addUniforms(uniforms: Array<IUniform<any>>) {
    this._uniforms = this._uniforms.concat(uniforms);
  }

  protected addAttributes(attributes: Array<Attribute<any>>) {
    this._attributes = this._attributes.concat(attributes);
  }

  protected setupVisualizerChain(): void {
    this.addDisposable(this._timeSource.observable().subscribe((time) => {
      this._timeUniform.value = time;
    }));
  }

  protected createPointCloudVisualization(shaderMaterial: THREE.ShaderMaterial): Array<THREE.Object3D> {
    console.log("This is a really boring pointcloud");
    return [];
  }

  protected createPointCloud(points: number, material: THREE.ShaderMaterial, pos: (i: number) => THREE.Vector3): THREE.PointCloud {
    var geometry = new THREE.Geometry();

    for (var i = 0; i < points; i++) {
      geometry.vertices.push(pos.call(i));
    }

    return new THREE.PointCloud(geometry, material);
  }

  object3DObservable(): Rx.Observable<Array<THREE.Object3D>> {
    return Rx.Observable.create<Array<THREE.Object3D>>((observer) => {
      this.setupVisualizerChain();

      this._shaderLoader.getShaderFromServer(this._shaderUrl)
        .map((shaderText) => UniformUtils.createShaderMaterialUniformsAttributes(shaderText, this._uniforms, this._attributes))
        .map((material) => this.createPointCloudVisualization(material))
        .doOnNext(__ => this.onCreated())
        .subscribe(observer);
    });
  }
}
