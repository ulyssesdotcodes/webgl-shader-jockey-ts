/// <reference path="../Models/AudioManager.ts"/>

class SpeakerController {
  private manager: AudioManager;

  constructor(manager: AudioManager) {
    this.manager = manager;
    manager.getAudioNodeObservable().subscribe(node => this.connectToSpeakers(node));
  }

  connectToSpeakers(node: AudioNode) {
    node.connect(this.manager.getContext().destination);
  }
}
