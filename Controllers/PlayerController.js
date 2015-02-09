var PlayerController = (function () {
    function PlayerController() {
        this.microphone = new Microphone();
    }
    PlayerController.prototype.onMicClick = function () {
        this.microphone.emitNode();
    };
    return PlayerController;
})();
