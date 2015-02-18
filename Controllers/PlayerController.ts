/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>

class PlayerController {
  private playerSource: MediaElementAudioSourceNode;

  private manager: AudioManager;
  private microphone: Microphone;
  private soundCloudLoader: SoundCloudLoader;

  constructor(manager: AudioManager) {
    this.manager = manager;

    this.microphone = new Microphone();
    this.microphone.getNodeObservable().subscribe((node: AudioNode) =>
      this.manager.updateSourceNode(node));

    this.soundCloudLoader = new SoundCloudLoader();
  }

  onMicClick(): void {
    this.microphone.emitNode(this.manager.context);
  }

  onUrl(url: string): void {
    this.soundCloudLoader.loadStream(url);
    this.manager.updateSourceNode(this.playerSource);
  }

  setPlayerSource(source: HTMLMediaElement) {
    this.playerSource = this.manager.context.createMediaElementSource(source);
  }

  getUrlObservable(): Rx.Observable<string> {
    return this.soundCloudLoader.getUrlObservable();
  }
}
