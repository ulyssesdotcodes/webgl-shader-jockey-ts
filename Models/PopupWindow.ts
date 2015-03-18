class PopupWindow {
  private _location: string;
  private _window: Window;

  constructor() {
    this._location = window.location.protocol + window.location.hostname;
  }

  openPopup(): void{
    this._window = window.open("viewer.html");
  }

  sendUniforms(uniforms: Array<IUniform<any>>): void {
    if(this._window === undefined) {
      return;
    }

    this._window.postMessage(uniforms, this._location);
  }
}
