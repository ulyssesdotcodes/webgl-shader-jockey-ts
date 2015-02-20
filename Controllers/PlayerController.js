/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>
var PlayerController = (function () {
    function PlayerController() {
        var _this = this;
        window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
        this.manager = new AudioManager(new AudioContext());
        this.microphone = new Microphone();
        this.microphone.getNodeObservable().subscribe(function (node) { return _this.manager.updateSourceNode(node); });
        this.soundCloudLoader = new SoundCloudLoader();
    }
    PlayerController.prototype.onMicClick = function () {
        this.microphone.emitNode(this.manager.context);
    };
    PlayerController.prototype.onUrl = function (url) {
        this.soundCloudLoader.loadStream(url);
        this.manager.updateSourceNode(this.playerSource);
    };
    PlayerController.prototype.setPlayerSource = function (source) {
        this.playerSource = this.manager.context.createMediaElementSource(source);
    };
    PlayerController.prototype.sampleAudio = function () {
        this.manager.sampleAudio();
    };
    PlayerController.prototype.getUrlObservable = function () {
        return this.soundCloudLoader.getUrlObservable();
    };
    return PlayerController;
})();
//# sourceMappingURL=PlayerController.js.map