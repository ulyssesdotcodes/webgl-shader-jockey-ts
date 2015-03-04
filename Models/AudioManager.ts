/// <reference path="../typed/rx.d.ts" />
/// <reference path="../typed/waa.d.ts" />
/// <reference path='./IUniform.ts'/>
/// <reference path="./IPropertiesProvider.ts" />

// Input: an audio context and a render time observable.
// Output: an IGLProperty Array observable containing sampled audio data.
class AudioManager implements IPropertiesProvider {
  static FFT_SIZE = 512;
  private _audioContext: AudioContext;

  private _timeUniform: IUniform;

  constructor(audioContext: AudioContext) {
    this._audioContext = audioContext;

    this._timeUniform = {
      name: "time",
      type: "f",
      value: 0.0
    };
  }

  updateSourceNode(sourceNode: AudioSourceNode) {
    sourceNode.connect(this.context.destination);
  }

  get context(): AudioContext {
    return this._audioContext;
  }

  glProperties(): Rx.Observable<Array<IUniform>> {
    return Rx.Observable.just([this._timeUniform]);
  }

  sampleAudio(): void {
    this._timeUniform.value = this._audioContext.currentTime;
  }
}
