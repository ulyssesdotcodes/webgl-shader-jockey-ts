/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>

class PlayerController {
  private playerSource: MediaElementAudioSourceNode;

  private _manager: AudioManager;
  get manager(): AudioManager { return this._manager; }
  private microphone: Microphone;
  private soundCloudLoader: SoundCloudLoader;

  constructor() {
    window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
    this._manager = new AudioManager(new AudioContext());

    this.microphone = new Microphone();
    this.microphone.getNodeObservable().subscribe((node: AudioNode) =>
      this.manager.updateSourceNode(node));

    // this.soundCloudLoader = new SoundCloudLoader();

    this.onMicClick();
  }

  onMicClick(): void {
    this.microphone.emitNode(this.manager.context);
  }

  onUrl(url: string): void {
    this.soundCloudLoader.loadStream(url);
    this.manager.updateSourceNode(this.playerSource);
    this.playerSource.connect(this._manager.context.destination);
  }

  setPlayerSource(source: HTMLMediaElement) {
    this.playerSource = this.manager.context.createMediaElementSource(source);
  }

  sampleAudio() {
    this.manager.sampleAudio();
  }

  getUrlObservable(): Rx.Observable<string> {
    return this.soundCloudLoader.getUrlObservable();
  }
}
