class AudioAnalyser {
  private _analyser: AnalyserNode;
  private fftSize: number;

  private frequencyBuffer: Uint8Array;
  private timeDomainBuffer: Uint8Array;

  private _connected: boolean;

  constructor(context: AudioContext, fftSize: number) {
    this._analyser = context.createAnalyser();

    this.fftSize = fftSize;

    this.frequencyBuffer = new Uint8Array(this.fftSize);
    this.timeDomainBuffer = new Uint8Array(this.fftSize);
  }

  connectSource(node: AudioNode) {
    node.connect(this._analyser);
    this._connected = true;
  }

  connectDestination(dest: AudioNode) {
    this._analyser.connect(dest);
  }

  getFrequencyData(): Uint8Array {
    if (this._connected) {
      this._analyser.getByteFrequencyData(this.frequencyBuffer);
    }
    return this.frequencyBuffer;
  }

  getTimeDomainData(): Uint8Array {
    if (this._connected) {
      this._analyser.getByteTimeDomainData(this.timeDomainBuffer);
    }
    return this.timeDomainBuffer;
  }
}
