class AudioManager {
  private sourceNode: AudioSourceNode;
  private audioNodeSubject: Rx.Subject<AudioNode>;

  constructor() {
    this.audioNodeSubject = new Rx.Subject<AudioNode>();
  }

  updateSourceNode(sourceNode: AudioSourceNode) {
    this.audioNodeSubject.onNext(sourceNode);
  }

  getAudioNodeObservable() {
    return this.audioNodeSubject.asObservable();
  }
}
