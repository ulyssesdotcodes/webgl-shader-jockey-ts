/// <reference path="../typed/rx.d.ts" />
/// <reference path="../typed/waa.d.ts" />
/// <reference path='./IUniform.ts'/>
/// <reference path="./IPropertiesProvider.ts" />
/// <reference path='./AudioAnalyser.ts'/>

class AudioManager {
  static FFT_SIZE = 1024;
  private _audioContext: AudioContext;
  private _audioAnalyser: AudioAnalyser;

  private _audioEventSubject: Rx.Subject<IAudioEvent>;
  AudioEventObservable: Rx.Observable<IAudioEvent>;

  constructor(audioContext: AudioContext) {
    this._audioContext = audioContext;

    this._audioEventSubject = new Rx.Subject<IAudioEvent>();
    this.AudioEventObservable = this._audioEventSubject.asObservable();
  }

  updateSourceNode(sourceNode: AudioSourceNode) {
    this._audioAnalyser = new AudioAnalyser(sourceNode, AudioManager.FFT_SIZE);
  }

  get context(): AudioContext {
    return this._audioContext;
  }

  sampleAudio(): void {
    if (this._audioAnalyser === undefined) {
      return;
    }

    var frequencyBuffer: Uint8Array = this._audioAnalyser.getFrequencyData();

    this._audioEventSubject.onNext({ frequencyBuffer: frequencyBuffer });
  }
}

interface IAudioEvent {
  frequencyBuffer: Uint8Array;
}
