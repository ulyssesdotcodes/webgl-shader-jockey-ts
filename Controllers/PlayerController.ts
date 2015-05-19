/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>
/// <reference path="../typed/rx.binding-lite.d.ts"/>

class PlayerController {
  private _manager: AudioManager;
  get manager(): AudioManager { return this._manager; }
  private microphone: Microphone;

  private _urlSubject: Rx.BehaviorSubject<string>;
  private _currentTrackSubject: Rx.BehaviorSubject<number>;
  private _tracks: Array<Track>;
  private _currentTrack: number;

  constructor(tracks: Array<Track>, manager: AudioManager) {
    this._tracks = tracks;
    this._currentTrack = 0;
    this._manager = manager;

    this._urlSubject = new Rx.BehaviorSubject<string>(tracks[this._currentTrack].url);

    this._currentTrackSubject = new Rx.BehaviorSubject<number>(0);
  }

  setPlayerSource(source: HTMLMediaElement) {
    var playerSource = this.manager.context.createMediaElementSource(source); this.manager.updateSourceNode(playerSource, true);

    source.onended = (ev: Event): void => this.nextSong();
  }

  getUrlObservable(): Rx.Observable<string> {
    return this._urlSubject.asObservable();
  }

  getTrackObservable(): Rx.Observable<number> {
    return this._currentTrackSubject.asObservable();
  }

  tracks(): Array<Track> {
    console.log(this._tracks);
    return this._tracks;
  }

  nextSong(): void {
    this._currentTrack++;
    if (this._currentTrack < this._tracks.length) {
      this._currentTrackSubject.onNext(this._currentTrack);
      this._urlSubject.onNext(this._tracks[this._currentTrack].url);
    }
  }
}
