/// <reference path="../Models/AudioManager.ts"/>
var SpeakerController = (function () {
    function SpeakerController(manager, audioContext) {
        var _this = this;
        this.audioContext = audioContext;
        this.manager = manager;
        manager.getAudioNodeObservable().subscribe(function (node) { return _this.connectToSpeakers(node); });
    }
    SpeakerController.prototype.connectToSpeakers = function (node) {
        node.connect(this.audioContext.destination);
    };
    return SpeakerController;
})();
//# sourceMappingURL=SpeakerController.js.map