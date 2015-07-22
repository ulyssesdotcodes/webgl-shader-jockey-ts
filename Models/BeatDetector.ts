class BeatDetector {
  static history = 43.0;
  static buckets = 8; // Don't change
  private _energyHistory: Array<Float32Array> = new Array();
  private _energyIndex = 0;
  private _averageEnergy = new Float32Array(BeatDetector.buckets);
  private _lastBeat = 0;
  private _deterioration = 0;

  constructor() {
    for (var i = 0; i < BeatDetector.buckets; i++) {
      this._energyHistory.push(new Float32Array(BeatDetector.history));
    }
  }

  calculateBeat(e: AudioEvent): number {
    var sum = new Float32Array(BeatDetector.buckets);
    var j;
    for (var i = 0; i < e.frequencyBuffer.length * 0.25; i++) {
      j = Math.log(i + 1) / Math.log(2);
      if(j % 1 == 0) {
        sum[j] = 0;
      }
      else {
        j = Math.floor(j);
      }

      sum[j] += e.frequencyBuffer[i];
    }

    var beat = -1.0;
    for (var i = 0; i < BeatDetector.buckets; i++) {
      sum[i] /= Math.pow(i + 1, 2) * 256.0;
      if (beat < 0) {
        beat = sum[i] - 1.4 * this._averageEnergy[i];
        if (beat > 0) {
          console.log("beat\n");
          beat = 1.0;
        }
      }
      this._averageEnergy[i] -=
        this._energyHistory[i][this._energyIndex] / BeatDetector.history;
      this._energyHistory[i][this._energyIndex] = sum[i];
      this._averageEnergy[i] += this._energyHistory[i][this._energyIndex] / BeatDetector.history;
      this._energyIndex++;
      if (this._energyIndex >= BeatDetector.history) {
        this._energyIndex = 0;
      }
    }

    if (beat > this._lastBeat) {
      this._lastBeat = beat;
      this._deterioration = 4 * beat / BeatDetector.history;
    }
    else {
      this._lastBeat -= this._deterioration;
      this._lastBeat = Math.max(this._lastBeat, 0.0);
    }

    return this._lastBeat;
  }

}
