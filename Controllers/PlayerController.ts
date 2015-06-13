/// <reference path="../Models/AudioSource.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>
/// <reference path="../typed/rx.binding-lite.d.ts"/>

class PlayerController {
  private _manager: AudioSource;
  get manager(): AudioSource { return this._manager; }
  private microphone: Microphone;

  private _urlSubject: Rx.BehaviorSubject<string>;
  private _currentTrackSubject: Rx.BehaviorSubject<number>;
  private _tracks: Array<Track>;
  private _currentTrack: number;

  constructor(tracks: Array<Track>, manager: AudioSource) {
    this._tracks = tracks;
    this._currentTrack = 0;
    this._manager = manager;

    this._urlSubject = new Rx.BehaviorSubject<string>(tracks[this._currentTrack].url);

    this._currentTrackSubject = new Rx.BehaviorSubject<number>(0);
  }

  setPlayerSource(source: HTMLMediaElement) {
    var playerSource = this.manager.usePlayerSource(source);

    source.onended = (ev: Event): void => this.nextSong();
  }

  getUrlObservable(): Rx.Observable<string> {
    return this._urlSubject.asObservable();
  }

  getTrackObservable(): Rx.Observable<number> {
    return this._currentTrackSubject.asObservable();
  }

  tracks(): Array<Track> {
    return this._tracks;
  }

  playTrack(track: number) {
    if (track < this._tracks.length) {
      this._currentTrackSubject.onNext(track);
      this._urlSubject.onNext(this._tracks[track].url);
      this._currentTrack = track;
    }
  }

  nextSong(): void {
    this._currentTrack++;
    this.playTrack(this._currentTrack);
  }
}
