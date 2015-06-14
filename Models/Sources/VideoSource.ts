class VideoSource implements Source<THREE.Texture>, UniformProvider<THREE.Texture> {
  private _videoElement: HTMLVideoElement;
  private _videoCanvas: HTMLCanvasElement;
  private _videoContext: CanvasRenderingContext2D;

  private _videoTexture: IUniform<THREE.Texture>;

  private _creating: Boolean = false;
  private _created: Boolean = false;

  constructor() {
    this._videoCanvas = document.createElement("canvas");
    this._videoCanvas.width = window.innerWidth;
    this._videoCanvas.height = window.innerHeight;
    this._videoContext = this._videoCanvas.getContext("2d");

    this._videoElement = document.createElement("video");
    this._videoElement.setAttribute("class", "camera");
    this._videoElement.setAttribute("autoplay", "true");
    this._videoElement.setAttribute("muted", "true");

    var texture = new THREE.Texture(this._videoCanvas);

    this._videoTexture = {
      name: "camera",
      type: "t",
      value: texture
    }

    navigator["getUserMedia"] = navigator["getUserMedia"]||
      navigator["webkitGetUserMedia"] ||
      navigator["mozGetUserMedia"];
    window["URL"] = window["URL"]|| window["webkitURL"];
  }

  createVideoSource() {
    this._creating = true;

    var gotStream = (stream) => {
      this._creating = false;
      this._created = true;
    	if (window["URL"])
    	{   this._videoElement.src = window["URL"].createObjectURL(stream);   }
    	else // Opera
    	{   this._videoElement.src = stream;   }

    	this._videoElement.onerror = function(e)
    	{   stream.stop();   };
    }

    navigator["getUserMedia"]({audio: false, video: true}, gotStream, console.log);
  }

  uniforms(): Array<IUniform<THREE.Texture>> {
    return [this._videoTexture];
  }

  observable(): Rx.Observable<THREE.Texture> {
    return Rx.Observable.just(this._videoTexture.value);
  }

  animate() {
    if (!(this._created || this._creating)) {
      this.createVideoSource();
      return;
    }

    if(this._creating) {
      return;
    }

    this._videoContext.drawImage(this._videoElement, 0, 0, this._videoCanvas.width, this._videoCanvas.height);

    this._videoTexture.value.needsUpdate = true;
  }
}
