/// <reference path="../Models/AudioManager.ts"/>

class SpeakerController {
  private manager: AudioManager;

  constructor(manager: AudioManager) {
    this.manager = manager;
    manager.getAudioNodeObservable().subscribe((node: AudioNode) => this.connectToSpeakers(node));
  }

  connectToSpeakers(node: AudioNode) {
    node.connect(this.manager.context.destination);
  }
}
