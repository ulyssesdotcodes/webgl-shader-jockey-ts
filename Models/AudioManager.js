var AudioManager = (function () {
    function AudioManager(audioContext) {
        this._audioTextureBuffer = new Uint8Array(AudioManager.FFT_SIZE * 4);
        this._audioContext = audioContext;
        var dataTexture = new THREE.DataTexture(this._audioTextureBuffer, AudioManager.FFT_SIZE, 1, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearMipMapLinearFilter, 1);
        this._audioTexture = {
            name: "audioTexture",
            type: "t",
            value: dataTexture
        };
    }
    AudioManager.prototype.updateSourceNode = function (sourceNode) {
        this._audioAnalyser = new AudioAnalyser(sourceNode, AudioManager.FFT_SIZE);
    };
    Object.defineProperty(AudioManager.prototype, "context", {
        get: function () {
            return this._audioContext;
        },
        enumerable: true,
        configurable: true
    });
    AudioManager.prototype.glProperties = function () {
        return Rx.Observable.just([this._audioTexture]);
    };
    AudioManager.prototype.sampleAudio = function () {
        if (this._audioAnalyser == undefined)
            return;
        var frequencyBuffer = this._audioAnalyser.getFrequencyData();
        for (var i in frequencyBuffer) {
            this._audioTextureBuffer[i * 4] = frequencyBuffer[i];
        }
        this._audioTexture.value.needsUpdate = true;
    };
    AudioManager.FFT_SIZE = 1024;
    return AudioManager;
})();
