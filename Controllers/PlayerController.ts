/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>
/// <reference path="../typed/rx.binding-lite.d.ts"/>

class PlayerController {
  private playerSource: MediaElementAudioSourceNode;

  private _manager: AudioManager;
  get manager(): AudioManager { return this._manager; }
  private microphone: Microphone;

  private _urlSubject: Rx.BehaviorSubject<string>;

  constructor(urls: Array<string>, manager: AudioManager) {
    this._urlSubject = new Rx.BehaviorSubject<string>('');

    this._manager = manager;

    this._urlSubject.onNext(urls[0]);
  }

  setPlayerSource(source: HTMLMediaElement) {
    this.playerSource = this.manager.context.createMediaElementSource(source); this.manager.updateSourceNode(this.playerSource, true);
  }

  getUrlObservable(): Rx.Observable<string> {
    return this._urlSubject.asObservable();
  }
}
