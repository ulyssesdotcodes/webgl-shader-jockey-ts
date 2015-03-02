var AudioAnalyser = (function () {
    function AudioAnalyser(audioNode, fftSize) {
        this.analyser = audioNode.context.createAnalyser();
        this.fftSize = fftSize;
        audioNode.connect(this.analyser);
        this.frequencyBuffer = new Uint8Array(this.fftSize);
    }
    AudioAnalyser.prototype.update = function (time) {
        this.analyser.getByteFrequencyData(this.frequencyBuffer);
    };
    return AudioAnalyser;
})();
