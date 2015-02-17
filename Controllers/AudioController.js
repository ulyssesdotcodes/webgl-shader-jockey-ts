/// <reference path="./PlayerController.ts"/>
/// <reference path="./SpeakerController.ts"/>
/// <reference path="../Models/AudioManager.ts"/>
var AudioController = (function () {
    function AudioController() {
        window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];
        this.audioContext = new AudioContext();
        this.manager = new AudioManager();
        this.playerController = new PlayerController(this.manager, this.audioContext);
        this.speakerController = new SpeakerController(this.manager, this.audioContext);
    }
    AudioController.prototype.getPlayerController = function () {
        return this.playerController;
    };
    return AudioController;
})();
//# sourceMappingURL=AudioController.js.map