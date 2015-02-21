/// <reference path="../typed/rx.d.ts" />
/// <reference path="../typed/waa.d.ts" />
/// <reference path="./IGLProperty.ts" />
/// <reference path="./TimeProperty.ts" />
// Input: an audio context and a render time observable.
// Output: an IGLProperty Array observable containing sampled audio data.
var AudioManager = (function () {
    function AudioManager(audioContext) {
        this._audioContext = audioContext;
        this.renderTimeObservable = new Rx.Subject();
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
        return this.renderTimeObservable.map(function (time) { return new TimeProperty(time); }).map(function (timeProperty) {
            var props = new Array();
            props.push(timeProperty);
            return props;
        });
    };
    AudioManager.prototype.sampleAudio = function () {
        this.renderTimeObservable.onNext(this._audioContext.currentTime);
    };
    AudioManager.FFT_SIZE = 512;
    return AudioManager;
})();
//# sourceMappingURL=AudioManager.js.map