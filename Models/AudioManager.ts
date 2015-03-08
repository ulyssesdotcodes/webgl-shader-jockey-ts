/// <reference path="../typed/rx.d.ts" />
/// <reference path="../typed/waa.d.ts" />
/// <reference path='./IUniform.ts'/>
/// <reference path="./IPropertiesProvider.ts" />
/// <reference path='./AudioAnalyser.ts'/>

class AudioManager implements IPropertiesProvider {
  static FFT_SIZE = 1024;
  private _audioContext: AudioContext;
  private _audioAnalyser: AudioAnalyser;

  private _audioTexture: IUniform;

  private _audioTextureBuffer = new Uint8Array(AudioManager.FFT_SIZE * 4);

  constructor(audioContext: AudioContext) {
    this._audioContext = audioContext;

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
  }

  updateSourceNode(sourceNode: AudioSourceNode) {
    this._audioAnalyser = new AudioAnalyser(sourceNode, AudioManager.FFT_SIZE);
  }

  get context(): AudioContext {
    return this._audioContext;
  }

  glProperties(): Rx.Observable<Array<IUniform>> {
    return Rx.Observable.just([this._audioTexture]);
  }

  sampleAudio(): void {
    if (this._audioAnalyser == undefined) return;

    var frequencyBuffer: Uint8Array = this._audioAnalyser.getFrequencyData();

    for (var i in frequencyBuffer) {
      this._audioTextureBuffer[i * 4] = frequencyBuffer[i];
    }

    this._audioTexture.value.needsUpdate = true;
  }
}
