/// <reference path="./Source"/>
/// <reference path="../AudioAnalyser"/>

class AudioSource implements Source<AudioEvent> {
  static FFT_SIZE = 1024;
  protected _audioContext: AudioContext;
  private _audioAnalyser: AudioAnalyser;

  private _audioEventSubject: Rx.Subject<AudioEvent>;

  constructor(audioContext: AudioContext) {
    this._audioContext = audioContext;
    this._audioAnalyser = new AudioAnalyser(this._audioContext, AudioSource.FFT_SIZE);

    this._audioEventSubject = new Rx.Subject<AudioEvent>();
  }

  updateSourceNode(sourceNode: AudioSourceNode) {
    this._audioAnalyser.connectSource(sourceNode);
  }

  usePlayerSource(source: HTMLMediaElement) {
    var mediaElement = this._audioContext.createMediaElementSource(source);
    this.updateSourceNode(mediaElement);
    this._audioAnalyser.connectDestination(this._audioContext.destination);

    return mediaElement;
  }

  observable(): Rx.Observable<AudioEvent> {
    return this._audioEventSubject.asObservable();
  }

  animate(): void {
    if (this._audioAnalyser === undefined) {
      return;
    }

    var frequencyBuffer: Uint8Array = this._audioAnalyser.getFrequencyData();
    var timeDomainBuffer: Uint8Array = this._audioAnalyser.getTimeDomainData();
    var eqSegments: THREE.Vector4 = this._audioAnalyser.getEQSegments();

    this._audioEventSubject.onNext({
      frequencyBuffer: frequencyBuffer,
      timeDomainBuffer: timeDomainBuffer
    });
  }
}

interface AudioEvent {
  frequencyBuffer: Uint8Array;
  timeDomainBuffer: Uint8Array;
}
