class Microphone {
  private created: Boolean;
  private node: AudioSourceNode;
  private nodeSubject: Rx.Subject<AudioSourceNode>;

  constructor(context: AudioContext) {
    this.created = false;
    this.nodeSubject = new Rx.Subject<AudioSourceNode>();
  }

  onContext(audioContext: AudioContext) {
    if (this.created) {
      this.nodeSubject.onNext(this.node);
      return;
    }

    var gotStream = (stream) => {
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
      this.created = false;
      return (alert("Error: getUserMedia not supported!"));
    }

    this.created = true;
  }

  nodeObservable(): Rx.Observable<AudioSourceNode> {
    return this.nodeSubject;
  }
}
