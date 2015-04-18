class WindowMessager {
  private _domain: string;
  private _window: Window;
  private _uniformsManager: UniformsManager;

  constructor(uniformsManager: UniformsManager) {
    this._uniformsManager = uniformsManager;

    this._domain = window.location.protocol + '//' + window.location.host;
  }

  onWindow(window: Window) {
    this._window = window;

    this._uniformsManager.UniformsObservable
      .subscribe(uniforms =>
        this._window.postMessage({
          type: "uniforms",
          data: uniforms
        }, this._domain));
  }

  onShader(shader: string) {
        this._window.postMessage({
          type: "shader",
          data: shader
        }, this._domain);
  }
}
