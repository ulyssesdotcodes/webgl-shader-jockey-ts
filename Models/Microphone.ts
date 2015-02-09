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

    var gotStream = function(stream){
      this.node = audioContext.createMediaStreamSource(stream);
      this.nodeSubject.onNext(node);
    }

    if ( navigator.getUserMedia )
      navigator.getUserMedia({ audio: true }, gotStream, (err) =>
        console.log(err))
    else if (navigator.webkitGetUserMedia )
      navigator.webkitGetUserMedia({ audio: true }, gotStream, (err) =>
        console.log(err))
    else if (navigator.mozGetUserMedia )
      navigator.mozGetUserMedia({ audio: true }, gotStream, (err) =>
        console.log(err))
    else
      return(alert("Error: getUserMedia not supported!"));
  }

  getNode(): AudioSourceNode {
    return this.node;
  }
}
