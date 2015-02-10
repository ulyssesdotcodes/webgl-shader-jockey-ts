class Microphone {
  private created: Boolean;
  private node: AudioSourceNode;
  private nodeSubject: Rx.Subject<AudioSourceNode>;

  constructor() {
    this.created = false;
    this.nodeSubject = new Rx.Subject<AudioSourceNode>();
  }

  emitNode(audioContext: AudioContext) {
    if (this.created) {
      this.nodeSubject.onNext(this.node);
      return;
    }

    var gotStream = (stream) => {
      this.node = audioContext.createMediaStreamSource(stream);
      this.nodeSubject.onNext(this.node);
    }

    if ( navigator.getUserMedia )
      navigator.getUserMedia({ audio: true, video: false }, gotStream, (err) =>
        console.log(err))
    else if (navigator.webkitGetUserMedia )
      navigator.webkitGetUserMedia({ audio: true, video: false }, gotStream, (err) =>
        console.log(err))
    else if (navigator.mozGetUserMedia )
      navigator.mozGetUserMedia({ audio: true, video:false }, gotStream, (err) =>
        console.log(err))
    else
      return(alert("Error: getUserMedia not supported!"));

    this.created = true;
  }

  getNodeObservable(): Rx.Observable<AudioSourceNode> {
    return this.nodeSubject;
  }
}
