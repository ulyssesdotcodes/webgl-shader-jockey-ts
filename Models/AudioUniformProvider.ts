class AudioUniformProvider implements IPropertiesProvider{
  private _audioManager: AudioManager;

  private _audioTexture: IUniform;
  private _audioTextureBuffer = new Uint8Array(AudioManager.FFT_SIZE * 4);

  constructor(audioManager: AudioManager) {
    this._audioManager = audioManager;

    var dataTexture = new THREE.DataTexture(
      this._audioTextureBuffer,
      AudioManager.FFT_SIZE,
      1,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
      THREE.UVMapping,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      THREE.LinearFilter,
      THREE.LinearMipMapLinearFilter,
      1);

    this._audioTexture = {
      name: "audioTexture",
      type: "t",
      value: dataTexture
    }

    this._audioManager.AudioEventObservable.subscribe((ae) => this.onAudioEvent(ae));
  }

  glProperties(): Rx.Observable<Array<IUniform>> {
    return Rx.Observable.just([this._audioTexture]);
  }

  onAudioEvent(audioEvent: IAudioEvent) {
    for (var i = 0; i < audioEvent.frequencyBuffer.length; i++) {
      this._audioTextureBuffer[i * 4] = audioEvent.frequencyBuffer[i];
    }

    this._audioTexture.value.needsUpdate = true;
  }
}
