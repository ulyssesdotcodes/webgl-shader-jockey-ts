module AudioUniformFunctions {
  export function updateAudioBuffer(e: AudioEvent, buf: Uint8Array): void {
    for (var i = 0; i < e.frequencyBuffer.length; i++) {
      buf[i * 4] = e.frequencyBuffer[i];
    }

    for (var i = 0; i < e.timeDomainBuffer.length; i++) {
      buf[i * 4 + 1] = e.frequencyBuffer[i];
    }
  }

  export function calculateEqs(e: AudioEvent, segmentSize: number): THREE.Vector4 {
    if (e.frequencyBuffer != undefined) {
      var vec = [0.0, 0.0, 0.0, 0.0];

      for(var i = 0; i < segmentSize * 4; i++) {
        var val = e.frequencyBuffer[i];
        vec[Math.floor(i/segmentSize)] += val * val / (255 - ((255 - val) * i / (segmentSize * 4.0)));
      }

      return new  THREE.Vector4(
        vec[0] / (256.0 * segmentSize),
        vec[1] / (256.0 * segmentSize),
        vec[2] / (256.0 * segmentSize),
        vec[3] / (256.0 * segmentSize)
      );
    }
    return new THREE.Vector4(0.0, 0.0, 0.0, 0.0);
  }

  export function calculateLoudness(e: AudioEvent) {
    var sum = 0.0;
    for (var i = 0; i < e.frequencyBuffer.length; i++) {
      sum += e.frequencyBuffer[i];
    }

    var volume = this._volume === undefined ? 1.0 : this._volume.value;

    var average: number = sum / e.frequencyBuffer.length;

    average = average / 128.0;

    return average;
  }
}
