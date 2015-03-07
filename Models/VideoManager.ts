class VideoManager implements IPropertiesProvider {
  private _videoElement: HTMLMediaElement;
  private _videoCanvas: HTMLCanvasElement;
  private _videoContext: CanvasRenderingContext2D;

  private _videoTexture: IUniform;

  constructor(videoElement: HTMLMediaElement) {
    this._videoElement = videoElement;

    this._videoCanvas = document.createElement("canvas");
    this._videoCanvas.width = window.innerWidth;
    this._videoCanvas.height = window.innerHeight;
    this._videoContext = this._videoCanvas.getContext("2d");

    var texture: THREE.Texture = new THREE.Texture(this._videoCanvas);

    this._videoTexture = {
      name: "camera",
      type: "t",
      value: texture
    }
  }

  glProperties(): Rx.Observable<Array<IUniform>> {
    return Rx.Observable.just([this._videoTexture]);
  }

  sampleVideo() {
    this._videoContext.drawImage(this._videoElement, 0, 0,
      this._videoCanvas.width, this._videoCanvas.height);

    this._videoTexture.value.needsUpdate = true;
  }
}
