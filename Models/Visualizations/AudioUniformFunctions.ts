/// <reference path="../BeatDetector.ts"/>

module AudioUniformFunctions {
  var beatDetector: BeatDetector;

  export function updateAudioBuffer(e: AudioEvent, buf: Uint8Array): void {
    for (var i = 0; i < e.frequencyBuffer.length; i++) {
      buf[i * 4] = e.frequencyBuffer[i];
    }

    for (var i = 0; i < e.timeDomainBuffer.length; i++) {
      buf[i * 4 + 1] = e.frequencyBuffer[i];
    }
  }

  export function calculateEqs(e: AudioEvent, segments: number): Array<number> {
    if (e.frequencyBuffer !== undefined) {
      var vec: Array<number> = [];

      for(var i = 0; i < segments; i++) {
        vec.push(0);
      }

      var segmentSize = e.frequencyBuffer.length * 0.33 / segments;

      for(var i = 0; i < segmentSize * segments; i++) {
        var val = e.frequencyBuffer[i];
        vec[Math.floor(i/segmentSize)] += val * val / (255 - ((255 - val) * i / (segmentSize * segments)));
      }

      for(i = 0; i < vec.length; i++) {
        vec[i] = vec[i] / (256.0 * segmentSize);
      }

      return vec;
    }
    return new Array(e.frequencyBuffer.length);
  }

  export function calculateLoudness(e: AudioEvent) {
    var sum = 0.0;
    for (var i = 0; i < e.frequencyBuffer.length; i++) {
      sum += e.frequencyBuffer[i];
    }

    var average: number = sum / e.frequencyBuffer.length;

    average = average / 128.0;

    return average;
  }

  export function calculateBeat(e: AudioEvent, c: number) {
    if(beatDetector === undefined) {
      beatDetector = new BeatDetector();
    }

    return beatDetector.calculateBeat(e, c);
  }
}
