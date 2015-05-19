class MicrophoneController {
  private _manager: AudioManager;

  private _microphone: Microphone;

  constructor(manager: AudioManager) {
    this._manager = manager;

    this._microphone = new Microphone(manager.context);
    this._microphone.nodeObservable().subscribe(node => this._manager.updateSourceNode(node, false));
    this._microphone.onContext(manager.context);
  }
}
