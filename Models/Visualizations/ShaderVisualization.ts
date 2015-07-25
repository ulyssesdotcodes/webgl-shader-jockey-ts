/// <reference path="./AudioUniformFunctions" />
/// <reference path="../ShaderPlane"/>

class ShaderVisualization extends BaseVisualization {
  protected _timeSource: TimeSource;
  protected _shaderLoader: ShaderLoader;

  protected _timeUniform: IUniform<number>;

  protected _uniforms: Array<IUniform<any>>;

  private _shaderUrl: string;

  constructor(resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, shaderUrl: string) {
    super();

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
    this.addDisposable(this._timeSource.observable().subscribe((time) => {
      this._timeUniform.value = time;
    })
      );
  }

  protected addUniforms(uniforms: Array<IUniform<any>>) {
    this._uniforms = this._uniforms.concat(uniforms);
  }

  animate(time): any {
    super.animate(time);

    this._timeUniform.value = time * 0.001;

    return {
      type: this.rendererId(),
      uniforms: this._uniforms
    };
  }

  object3DObservable(): Rx.Observable<Array<THREE.Mesh>> {
    return Rx.Observable.create<Array<THREE.Mesh>>((observer) => {
      this.setupVisualizerChain();

      this._shaderLoader.getShaderFromServer(this._shaderUrl)
        .map((shader) => new ShaderPlane(shader, this._uniforms))
        .doOnNext(__ => this.onCreated())
        .map((shaderplane) => [shaderplane.mesh])
        .subscribe(observer);
    });
  }

  rendererId(): string {
    return IDs.shader;
  }
}
