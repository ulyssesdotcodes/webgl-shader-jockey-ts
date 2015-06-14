class Microphone {
  private _created: Boolean;
  private _creating: Boolean;
  private node: AudioSourceNode;
  private nodeSubject: Rx.Subject<AudioSourceNode>;

  constructor() {
    this._created = false;
    this.nodeSubject = new Rx.Subject<AudioSourceNode>();
  }

  isCreatingOrCreated(): Boolean {
    return this._created || this._creating;
  }

  onContext(audioContext: AudioContext) {
    if (this._created) {
      this.nodeSubject.onNext(this.node);
      return;
    }

    if (this._creating) {
      return;
    }

    this._creating = true;

    var gotStream = (stream) => {
      this._created = true;
      this.node = audioContext.createMediaStreamSource(stream);
      this.nodeSubject.onNext(this.node);
    }

    if (navigator.getUserMedia) {
      navigator.getUserMedia({ audio: true, video: false }, gotStream, (err) =>
        console.log(err));
    }
    else if (navigator.webkitGetUserMedia) {
      navigator.webkitGetUserMedia({ audio: true, video: false }, gotStream, (err) =>
        console.log(err));
    }
    else if (navigator.mozGetUserMedia) {
      navigator.mozGetUserMedia({ audio: true, video: false }, gotStream, (err) =>
        console.log(err));
    }
    else {
      this._creating = false;
      return (alert("Error: getUserMedia not supported!"));
    }

  }

  nodeObservable(): Rx.Observable<AudioSourceNode> {
    return this.nodeSubject;
  }
}
