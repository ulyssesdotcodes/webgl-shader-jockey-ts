var AudioManager = (function () {
    function AudioManager() {
        this.audioNodeSubject = new Rx.Subject();
    }
    AudioManager.prototype.updateSourceNode = function (sourceNode) {
        this.audioNodeSubject.onNext(sourceNode);
    };
    AudioManager.prototype.getAudioNodeObservable = function () {
        return this.audioNodeSubject.asObservable();
    };
    return AudioManager;
})();
