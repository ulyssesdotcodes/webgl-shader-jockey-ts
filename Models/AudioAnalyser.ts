class AudioAnalyser {
  private _analyser: AnalyserNode;
  private fftSize: number;
  private segmentSize: number;

  private frequencyBuffer: Uint8Array;
  private timeDomainBuffer: Uint8Array;

  private _connected: boolean;

  constructor(context: AudioContext, fftSize: number) {
    this._analyser = context.createAnalyser();

    this.fftSize = fftSize;
    this.segmentSize = fftSize / 8.0;

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

  getEQSegments(): THREE.Vector4 {
    if (this.frequencyBuffer != undefined) {
      var vec = [0.0, 0.0, 0.0, 0.0];

      for(var i = 0; i < this.segmentSize * 4; i++) {
        var val = this.frequencyBuffer[i];
        vec[Math.floor(i/this.segmentSize)] += val * val / (255 - ((255 - val) * i / (this.segmentSize * 4.0)));
      }

      return new  THREE.Vector4(
        vec[0] / (256.0 * this.segmentSize),
        vec[1] / (256.0 * this.segmentSize),
        vec[2] / (256.0 * this.segmentSize),
        vec[3] / (256.0 * this.segmentSize)
      );
    }
    return new THREE.Vector4(0.0, 0.0, 0.0, 0.0);
  }

  getTimeDomainData(): Uint8Array {
    if (this._connected) {
      this._analyser.getByteTimeDomainData(this.timeDomainBuffer);
    }
    return this.timeDomainBuffer;
  }
}
