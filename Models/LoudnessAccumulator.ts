class LoudnessAccumulator implements IPropertiesProvider {
  private _accumulatedUniform: IUniform;

  constructor(audioManager: AudioManager) {
    this._accumulatedUniform = {
      name: "accumulatedLoudness",
      type: "f",
      value: 0.0
    };

    audioManager.AudioEventObservable.subscribe(ae => this.onAudioEvent(ae))
  }

  onAudioEvent(audioEvent: IAudioEvent): void {
    var sum = 0.0;
    for(var i = 0; i < audioEvent.frequencyBuffer.length; i++) {
      sum += audioEvent.frequencyBuffer[i];
    }

    var average: number = sum / audioEvent.frequencyBuffer.length;

    average = average / 128.0;

    average *= average;

    this._accumulatedUniform.value += average;
  }

  glProperties(): Rx.Observable<Array<IUniform>> {
    return Rx.Observable.just([this._accumulatedUniform]);
  }
}
