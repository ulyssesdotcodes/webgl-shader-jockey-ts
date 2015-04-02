class LoudnessAccumulator implements IPropertiesProvider<number> {
  private _accumulatedUniform: IUniform<number>;
  private _loudnessUniform: IUniform<number>;
  private _volume: IUniform<number>;

  constructor(audioManager: AudioManager) {
    this._accumulatedUniform = {
      name: "accumulatedLoudness",
      type: "f",
      value: 0.0
    };

    this._loudnessUniform = {
      name: "loudness",
      type: "f",
      value: 0.0
    };

    audioManager.AudioEventObservable.subscribe(ae => this.onAudioEvent(ae))
  }

  setVolumeUniform(volumeUniform: IUniform<number>) {
    this._volume = volumeUniform;
  }

  onAudioEvent(audioEvent: IAudioEvent): void {
    var sum = 0.0;
    for(var i = 0; i < audioEvent.frequencyBuffer.length; i++) {
      sum += audioEvent.frequencyBuffer[i];
    }

    var volume = this._volume === undefined ? 1.0 : this._volume.value;

    var average: number = sum / audioEvent.frequencyBuffer.length;

    average = average / 128.0;

    this._accumulatedUniform.value += average * volume;
    this._loudnessUniform.value = average;
  }

  glProperties(): Rx.Observable<Array<IUniform<number>>> {
    return Rx.Observable.just([this._accumulatedUniform, this._loudnessUniform]);
  }
}
