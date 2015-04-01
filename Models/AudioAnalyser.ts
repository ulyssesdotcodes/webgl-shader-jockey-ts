class AudioAnalyser {
  private _analyser: AnalyserNode;
  private fftSize: number;

  private frequencyBuffer: Uint8Array;
  private timeDomainBuffer: Uint8Array;

  constructor(audioNode: AudioNode, fftSize: number) {
    this._analyser = audioNode.context.createAnalyser();

    this.fftSize = fftSize;
    audioNode.connect(this._analyser);

    this.frequencyBuffer = new Uint8Array(this.fftSize);
    this.timeDomainBuffer = new Uint8Array(this.fftSize);
  }

  getFrequencyData(): Uint8Array {
    this._analyser.getByteFrequencyData(this.frequencyBuffer);
    return this.frequencyBuffer;
  }

  getTimeDomainData(): Uint8Array {
    this._analyser.getByteTimeDomainData(this.timeDomainBuffer);
    return this.timeDomainBuffer;
  }
}
