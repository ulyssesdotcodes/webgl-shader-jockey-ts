class MicrophoneController {
  private _manager: AudioManager;

  private _microphone: Microphone;

  constructor(manager: AudioManager) {
    this._manager = manager;

    this.microphone = new Microphone(manager.context);
    this.microphone.nodeObservable().subscribe(node => this._manager.updateSourceNode(node, false));
    this.microphone.onContext(manager.context);
  }
}
