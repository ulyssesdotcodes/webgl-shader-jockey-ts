/// <reference path="./AudioUniformFunctions" />

class ShaderVisualization extends BaseVisualization {
  protected _timeSource: TimeSource;
  protected _shaderLoader: ShaderLoader;

  private _timeUniform: IUniform<number>;

  private _uniforms: Array<IUniform<any>>;

  private _shaderUrl: string;

  constructor(resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, shaderUrl: string) {
    super();

    this.addSources([timeSource]);

    this._shaderUrl = shaderUrl;

    this._timeSource = timeSource;
    this._shaderLoader = shaderLoader;

    this._timeUniform = {
      name: "time",
      type: "f",
      value: 0.0
    };

    this._uniforms = [<IUniform<any>> this._timeUniform].concat(resolutionProvider.uniforms());
  }

  protected setupVisualizerChain(): void {
    this.addDisposable(this._timeSource.SourceObservable.subscribe((time) => {
      this._timeUniform.value = time;
    })
      );
  }

  protected addUniforms(uniforms: Array<IUniform<any>>) {
    this._uniforms = this._uniforms.concat(uniforms);
  }

  meshObservable(): Rx.Observable<Array<THREE.Mesh>> {
    return Rx.Observable.create<Array<THREE.Mesh>>((observer) => {
      this.setupVisualizerChain();

      this._shaderLoader.getShaderFromServer(this._shaderUrl)
        .map((shader) => new ShaderPlane(shader, this._uniforms))
        .map((shaderplane) => [shaderplane.mesh])
        .subscribe(observer);
    });
  }
}
