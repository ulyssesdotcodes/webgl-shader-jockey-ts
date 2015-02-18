/// <reference path="./PlayerController.ts"/>
/// <reference path="./SpeakerController.ts"/>
/// <reference path="../Models/AudioManager.ts"/>

class AudioController {
  private _playerController: PlayerController;
  private _speakerController: SpeakerController;
  private _manager: AudioManager;

  constructor() {
    window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
    this._manager = new AudioManager(new AudioContext());
    this._playerController = new PlayerController(this._manager);
    this._speakerController = new SpeakerController(this._manager);
  }

  get playerController() {
    return this._playerController;
  }

  get manager() {
    return this._manager;
  }

  sampleAudio(): void {
    this._manager.sampleAudio();
  }
}
