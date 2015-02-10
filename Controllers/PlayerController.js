var PlayerController = (function () {
    function PlayerController(manager, audioContext) {
        var _this = this;
        this.audioContext = audioContext;
        this.manager = manager;
        this.microphone = new Microphone();
        this.microphone.getNodeObservable().subscribe(function (node) { return _this.manager.updateSourceNode(node); });
    }
    PlayerController.prototype.onMicClick = function () {
        this.microphone.emitNode(this.audioContext);
    };
    PlayerController.prototype.getSourceObservable = function () {
        return this.nodeSubject.asObservable();
    };
    return PlayerController;
})();
