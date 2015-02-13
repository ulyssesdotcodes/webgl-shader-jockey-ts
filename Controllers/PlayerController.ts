/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>

class PlayerController {
  private audioContext: AudioContext;

  private manager: AudioManager;

  private micActive: Boolean;
  private microphone: Microphone;

  private nodeSubject: Rx.Subject<AudioSourceNode>;

  constructor(manager: AudioManager, audioContext: AudioContext) {
    this.audioContext = audioContext;

    this.manager = manager;

    this.microphone = new Microphone();
    this.microphone.getNodeObservable().subscribe(node =>
      this.manager.updateSourceNode(node));
  }

  onMicClick(): void {
    this.microphone.emitNode(this.audioContext);
  }

  getSourceObservable(): Rx.Observable<AudioSourceNode> {
    return this.nodeSubject.asObservable();
  }
}
