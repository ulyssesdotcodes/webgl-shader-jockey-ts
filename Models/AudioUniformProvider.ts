class AudioUniformProvider implements IPropertiesProvider<THREE.DataTexture>{
  private _audioManager: AudioManager;

  private _audioTexture: IUniform<THREE.DataTexture>;
  private _audioTextureBuffer = new Uint8Array(AudioManager.FFT_SIZE * 4);

  private _eqSegments: IUniform<THREE.Vector4>;

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

    this._eqSegments = {
      name: "eqSegments",
      type: "v4",
      value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0)
    }

    this._audioManager.AudioEventObservable.subscribe((ae) => this.onAudioEvent(ae));
  }

  glProperties(): Rx.Observable<Array<IUniform<any>>> {
    return Rx.Observable.just([this._audioTexture, this._eqSegments]);
  }

  onAudioEvent(audioEvent: IAudioEvent) {
    for (var i = 0; i < audioEvent.frequencyBuffer.length; i++) {
      this._audioTextureBuffer[i * 4] = audioEvent.frequencyBuffer[i];
    }

    for (var i = 0; i < audioEvent.timeDomainBuffer.length; i++) {
      this._audioTextureBuffer[i * 4 + 1] = audioEvent.frequencyBuffer[i];
    }

    this._audioTexture.value.needsUpdate = true;

    this._eqSegments.value = audioEvent.eqSegments;
  }
}
