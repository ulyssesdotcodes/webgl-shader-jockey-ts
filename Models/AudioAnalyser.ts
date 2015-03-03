class AudioAnalyser {
  private analyser: AnalyserNode;
  private fftSize: number;

  private frequencyBuffer: Uint8Array;

  constructor(audioNode: AudioNode, fftSize: number) {
    this.analyser = audioNode.context.createAnalyser();

    this.fftSize = fftSize;
    audioNode.connect(this.analyser);

    this.frequencyBuffer = new Uint8Array(this.fftSize);
  }

  update(time: number) {
    this.analyser.getByteFrequencyData(this.frequencyBuffer);
  }
}
