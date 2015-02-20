/// <reference path="../typed/rx.d.ts" />
/// <reference path="../typed/waa.d.ts" />
/// <reference path="./IGLProperty.ts" />
/// <reference path="./TimeProperty.ts" />

// Input: an audio context and a render time observable.
// Output: an IGLProperty Array observable containing sampled audio data.
class AudioManager {
  static FFT_SIZE = 512;
  private _audioContext: AudioContext;

  private renderTimeObservable: Rx.Subject<number>;

  constructor(audioContext: AudioContext) {
    this._audioContext = audioContext;

    this.renderTimeObservable = new Rx.Subject<number>();
  }

  updateSourceNode(sourceNode: AudioSourceNode) {
    sourceNode.connect(this.context.destination);
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
