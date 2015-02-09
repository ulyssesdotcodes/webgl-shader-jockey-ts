/// <reference path="../Models/Microphone.ts"/>

class PlayerController {
  private micActive: Boolean;
  private microphone: Microphone;

  private audioContext: AudioContext;

  private nodeSubject: Rx.Subject<AudioSourceNode>;

  constructor() {
    this.microphone = new Microphone();
  }

  onMicClick(): void {
    this.microphone.emitNode();
  }
}
