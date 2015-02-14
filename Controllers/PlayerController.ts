/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>

class PlayerController {
  private audioContext: AudioContext;

  private playerSource: MediaElementAudioSourceNode;

  private manager: AudioManager;
  private microphone: Microphone;
  private soundCloudLoader: SoundCloudLoader;

  constructor(manager: AudioManager, audioContext: AudioContext) {
    this.audioContext = audioContext;

    this.manager = manager;

    this.microphone = new Microphone();
    this.microphone.getNodeObservable().subscribe(node =>
      this.manager.updateSourceNode(node));

    this.soundCloudLoader = new SoundCloudLoader();
  }

  onMicClick(): void {
    this.microphone.emitNode(this.audioContext);
  }

  onUrl(url: string): void {
    this.soundCloudLoader.loadStream(url);
    this.manager.updateSourceNode(this.playerSource);
  }

  setPlayerSource(source: HTMLMediaElement) {
    this.playerSource = this.audioContext.createMediaElementSource(source);
  }

  getUrlObservable(): Rx.Observable<string> {
    return this.soundCloudLoader.getUrlObservable();
  }
}
