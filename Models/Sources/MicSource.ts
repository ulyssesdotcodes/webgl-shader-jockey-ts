/// <reference path="../Microphone"/>
/// <reference path="./AudioSource"/>

class MicSource extends AudioSource {
  private _microphone: Microphone;

  constructor(audioContext: AudioContext) {
    super(audioContext);
    this._microphone = new Microphone();

    this._microphone.nodeObservable().subscribe(node => this.updateSourceNode(node));
  }

  animate(): void{
    if (!this._microphone.isCreatingOrCreated()) {
      this._microphone.onContext(this._audioContext);
    }

    super.animate();
  }
}
