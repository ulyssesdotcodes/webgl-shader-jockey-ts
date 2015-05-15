/// <reference path="../typed/rx.d.ts" />
/// <reference path="../typed/waa.d.ts" />
/// <reference path='./IUniform.ts'/>
/// <reference path="./IPropertiesProvider.ts" />
/// <reference path='./AudioAnalyser.ts'/>
/// <reference path="../typed/three.d.ts"/>

class AudioManager {
  static FFT_SIZE = 1024;
  private _audioContext: AudioContext;
  private _audioAnalyser: AudioAnalyser;

  private _audioEventSubject: Rx.Subject<IAudioEvent>;
  AudioEventObservable: Rx.Observable<IAudioEvent>;

  constructor(audioContext: AudioContext) {
    this._audioContext = audioContext;
    this._audioAnalyser = new AudioAnalyser(this._audioContext, AudioManager.FFT_SIZE);

    this._audioEventSubject = new Rx.Subject<IAudioEvent>();
    this.AudioEventObservable = this._audioEventSubject.asObservable();
  }

  updateSourceNode(sourceNode: AudioSourceNode, connectToDestination: boolean) {
    this._audioAnalyser.connectSource(sourceNode);

    if(connectToDestination) {
      this._audioAnalyser.connectDestination(this._audioContext.destination);
    }
  }

  get context(): AudioContext {
    return this._audioContext;
  }

  sampleAudio(): void {
    if (this._audioAnalyser === undefined) {
      return;
    }

    var frequencyBuffer: Uint8Array = this._audioAnalyser.getFrequencyData();
    var timeDomainBuffer: Uint8Array = this._audioAnalyser.getTimeDomainData();

    this._audioEventSubject.onNext({
      frequencyBuffer: frequencyBuffer,
      timeDomainBuffer: timeDomainBuffer
    });
  }
}

interface IAudioEvent {
  frequencyBuffer: Uint8Array;
  timeDomainBuffer: Uint8Array;
}
