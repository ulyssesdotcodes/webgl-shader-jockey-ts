var AudioAnalyser = (function () {
    function AudioAnalyser(audioNode, fftSize) {
        this._analyser = audioNode.context.createAnalyser();
        this.fftSize = fftSize;
        audioNode.connect(this._analyser);
        this.frequencyBuffer = new Uint8Array(this.fftSize);
    }
    AudioAnalyser.prototype.getFrequencyData = function () {
        this._analyser.getByteFrequencyData(this.frequencyBuffer);
        return this.frequencyBuffer;
    };
    return AudioAnalyser;
})();
