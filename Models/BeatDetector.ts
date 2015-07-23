class BeatDetector {
  static history = 43.0;
  static buckets = 20; // Don't change
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
    var j = 0;
    var finalBucketIndex = 1;
    var i = 0;
    while(j < BeatDetector.buckets){
      if(i >= finalBucketIndex) {
        j++;
        finalBucketIndex = j * (j + 1) * 0.5;
      }

      sum[j] += e.frequencyBuffer[i];
      i++;
    }

    var beat = -1.0;
    for (var i = 0; i < BeatDetector.buckets; i++) {
      sum[i] /= Math.pow(2, i + 1) * 256.0;
      if (beat < 0) {
        beat = sum[i] - 1.4 * this._averageEnergy[i];
        if (beat > 0) {
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
      this._deterioration = 8 * beat / BeatDetector.history;
    }
    else {
      this._lastBeat -= this._deterioration;
      this._lastBeat = Math.max(this._lastBeat, 0.0);
    }

    return this._lastBeat;
  }

}
