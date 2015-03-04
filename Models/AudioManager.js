var AudioManager = (function () {
    function AudioManager(audioContext) {
        this._audioContext = audioContext;
        this._timeUniform = {
            name: "time",
            type: "f",
            value: 0.0
        };
    }
    AudioManager.prototype.updateSourceNode = function (sourceNode) {
        sourceNode.connect(this.context.destination);
    };
    Object.defineProperty(AudioManager.prototype, "context", {
        get: function () {
            return this._audioContext;
        },
        enumerable: true,
        configurable: true
    });
    AudioManager.prototype.glProperties = function () {
        return Rx.Observable.just([this._timeUniform]);
    };
    AudioManager.prototype.sampleAudio = function () {
        this._timeUniform.value = this._audioContext.currentTime;
    };
    AudioManager.FFT_SIZE = 512;
    return AudioManager;
})();
