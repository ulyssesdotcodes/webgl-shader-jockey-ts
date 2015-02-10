/// <reference path="../Models/AudioManager.ts"/>

class SpeakerController {
  private audioContext: AudioContext;
  private manager: AudioManager;

  constructor(manager: AudioManager, audioContext: AudioContext){
    this.audioContext = audioContext;
    this.manager = manager;

    manager.getAudioNodeObservable().subscribe(node => this.connectToSpeakers(node));
  }

  connectToSpeakers(node: AudioNode) {
    node.connect(this.audioContext.destination);
  }
}
