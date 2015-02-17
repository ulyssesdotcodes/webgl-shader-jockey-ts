/// <reference path="./PlayerController.ts"/>
/// <reference path="./SpeakerController.ts"/>
/// <reference path="../Models/AudioManager.ts"/>

class AudioController {
  private playerController: PlayerController;
  private speakerController: SpeakerController;
  private manager: AudioManager;

  constructor() {
    window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext']
    this.manager = new AudioManager(new AudioContext());
    this.playerController = new PlayerController(this.manager);
    this.speakerController = new SpeakerController(this.manager);
  }

  getPlayerController() {
    return this.playerController;
  }

  getGLPropertiesObservable(): Rx.Observable<Array<IGLProperty>> {
    return this.manager.getGLPropertiesObservable();
  }

  sampleAudio(): void {
    this.manager.sampleAudio();
  }
}
