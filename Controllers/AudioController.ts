/// <reference path="./PlayerController.ts"/>
/// <reference path="./SpeakerController.ts"/>
/// <reference path="../Models/AudioManager.ts"/>

class AudioController{
  private audioContext: AudioContext;
  private playerController: PlayerController;
  private speakerController: SpeakerController;
  private manager: AudioManager;

  constructor() {
    window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext']
    this.audioContext = new AudioContext();
    this.manager = new AudioManager();
    this.playerController = new PlayerController(this.manager, this.audioContext);
    this.speakerController = new SpeakerController(this.manager, this.audioContext);
  }

  getPlayerController() {
    return this.playerController;
  }
}
