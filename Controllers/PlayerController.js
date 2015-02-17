/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>
var PlayerController = (function () {
    function PlayerController(manager, audioContext) {
        var _this = this;
        this.audioContext = audioContext;
        this.manager = manager;
        this.microphone = new Microphone();
        this.microphone.getNodeObservable().subscribe(function (node) { return _this.manager.updateSourceNode(node); });
        this.soundCloudLoader = new SoundCloudLoader();
    }
    PlayerController.prototype.onMicClick = function () {
        this.microphone.emitNode(this.audioContext);
    };
    PlayerController.prototype.onUrl = function (url) {
        this.soundCloudLoader.loadStream(url);
        this.manager.updateSourceNode(this.playerSource);
    };
    PlayerController.prototype.setPlayerSource = function (source) {
        this.playerSource = this.audioContext.createMediaElementSource(source);
    };
    PlayerController.prototype.getUrlObservable = function () {
        return this.soundCloudLoader.getUrlObservable();
    };
    return PlayerController;
})();
//# sourceMappingURL=PlayerController.js.map