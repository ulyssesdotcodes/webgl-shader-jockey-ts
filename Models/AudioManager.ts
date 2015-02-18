// Input: an audio context and a render time observable.
// Output: an IGLProperty Array observable containing sampled audio data.
class AudioManager {
  static FFT_SIZE = 512;
  private _audioContext: AudioContext;

  private audioNodeSubject: Rx.Subject<AudioNode>;

  private audioAnalyser: AudioAnalyser;

  private renderTimeObservable: Rx.Subject<number>;

  constructor(audioContext: AudioContext) {
    this.audioNodeSubject = new Rx.Subject<AudioNode>();
    this._audioContext = audioContext;

    this.audioNodeSubject.subscribe((node: AudioNode) =>
      this.audioAnalyser = new AudioAnalyser(node, AudioManager.FFT_SIZE));

    this.renderTimeObservable = new Rx.Subject<number>();
  }

  updateSourceNode(sourceNode: AudioSourceNode) {
    this.audioNodeSubject.onNext(sourceNode);
  }

  getAudioNodeObservable(): Rx.Observable<AudioNode> {
    return this.audioNodeSubject.asObservable();
  }

  get context(): AudioContext {
    return this._audioContext;
  }

  get audioGLPropertiesObservable(): Rx.Observable<Array<IGLProperty>> {
    return this.renderTimeObservable.map((time: number) => new TimeProperty(time))
      .map((timeProperty: TimeProperty) => {
        var props: Array<IGLProperty> = new Array<IGLProperty>();
        props.push(timeProperty);
        return props;
      });
  }

  sampleAudio(): void {
    this.renderTimeObservable.onNext(this._audioContext.currentTime);
  }
}
