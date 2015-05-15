/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>
/// <reference path="../typed/rx.binding.d.ts"/>

class PlayerController {
  private playerSource: MediaElementAudioSourceNode;

  private _manager: AudioManager;
  get manager(): AudioManager { return this._manager; }
  private microphone: Microphone;

  private _urlSubject: Rx.BehaviorSubject<string>;

  constructor(urls: Array<string>) {
    this._urlSubject = new Rx.BehaviorSubject<string>();

    // window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
    this._manager = new AudioManager(new AudioContext());

    this.microphone = new Microphone();
    this.microphone.getNodeObservable().subscribe((node: AudioNode) =>
      this.manager.updateSourceNode(node, false));

    if (urls == undefined || urls.length == 0) {
      this.onMicClick();
    }
    else {
      this._urlSubject.onNext(urls[0]);
    }
  }

  onMicClick(): void {
    this.microphone.emitNode(this.manager.context);
  }

  setPlayerSource(source: HTMLMediaElement) {
    this.playerSource = this.manager.context.createMediaElementSource(source); this.manager.updateSourceNode(this.playerSource, true);
  }

  sampleAudio() {
    this.manager.sampleAudio();
  }

  getUrlObservable(): Rx.Observable<string> {
    return this._urlSubject.asObservable();
  }
}
