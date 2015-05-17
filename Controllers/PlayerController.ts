/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>
/// <reference path="../typed/rx.binding-lite.d.ts"/>

class PlayerController {
  private _manager: AudioManager;
  get manager(): AudioManager { return this._manager; }
  private microphone: Microphone;

  private _urlSubject: Rx.BehaviorSubject<string>;
  private _urls: Array<string>;
  private _currentUrl: number;

  constructor(urls: Array<string>, manager: AudioManager) {
    this._urls = urls;
    this._currentUrl = 0;

    this._manager = manager;

    this._urlSubject = new Rx.BehaviorSubject<string>('');
    this._urlSubject.onNext(urls[this._currentUrl]);
  }

  setPlayerSource(source: HTMLMediaElement) {
    var playerSource = this.manager.context.createMediaElementSource(source); this.manager.updateSourceNode(playerSource, true);

    source.onended = (ev: Event): void => this.nextSong();
  }

  getUrlObservable(): Rx.Observable<string> {
    return this._urlSubject.asObservable();
  }

  nextSong(): void {
    this._currentUrl++;
    if (this._currentUrl < this._urls.length) {
      this._urlSubject.onNext(this._urls[this._currentUrl]);
    }
  }
}
