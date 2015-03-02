var PlayerController = (function () {
    function PlayerController() {
        var _this = this;
        window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
        this._manager = new AudioManager(new AudioContext());
        this.microphone = new Microphone();
        this.microphone.getNodeObservable().subscribe(function (node) { return _this.manager.updateSourceNode(node); });
        this.soundCloudLoader = new SoundCloudLoader();
    }
    Object.defineProperty(PlayerController.prototype, "manager", {
        get: function () {
            return this._manager;
        },
        enumerable: true,
        configurable: true
    });
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
