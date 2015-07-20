class BeatDetector {
  static history = 43.0;
  private _energyHistory: Float32Array = new Float32Array(BeatDetector.history);
  private _energyIndex = 0;
  private _averageEnergy = 0;
  private _lastBeat = 0;
  private _deterioration = 0;

  calculateBeat(e: AudioEvent): number {
    var sum = 0;
    for(var i = 0; i < e.frequencyBuffer.length; i++) {
      sum += e.frequencyBuffer[i];
    }

    sum /= e.frequencyBuffer.length * 256.0;

    var beat = sum - 1.3 * this._averageEnergy;
    if(beat > 0) {
      beat = beat / Math.abs(beat);
    }
    if(beat > this._lastBeat) {
      this._lastBeat = beat;
      this._deterioration = 4 * beat / BeatDetector.history;
    }
    else {
      this._lastBeat -= this._deterioration;
      this._lastBeat = Math.max(this._lastBeat, 0.0);
    }

    this._averageEnergy -= this._energyHistory[this._energyIndex] / BeatDetector.history;
    this._energyHistory[this._energyIndex] = sum;
    this._averageEnergy += this._energyHistory[this._energyIndex] / BeatDetector.history;
    this._energyIndex++;
    if(this._energyIndex >= BeatDetector.history) {
      this._energyIndex = 0;
    }

    return this._lastBeat;
  }

}
