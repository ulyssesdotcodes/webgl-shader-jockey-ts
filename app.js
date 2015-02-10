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
var Microphone = (function () {
    function Microphone() {
        this.created = false;
        this.nodeSubject = new Rx.Subject();
    }
    Microphone.prototype.emitNode = function (audioContext) {
        var _this = this;
        if (this.created) {
            this.nodeSubject.onNext(this.node);
            return;
        }
        var gotStream = function (stream) {
            _this.node = audioContext.createMediaStreamSource(stream);
            _this.nodeSubject.onNext(_this.node);
        };
        if (navigator.getUserMedia)
            navigator.getUserMedia({ audio: true, video: false }, gotStream, function (err) { return console.log(err); });
        else if (navigator.webkitGetUserMedia)
            navigator.webkitGetUserMedia({ audio: true, video: false }, gotStream, function (err) { return console.log(err); });
        else if (navigator.mozGetUserMedia)
            navigator.mozGetUserMedia({ audio: true, video: false }, gotStream, function (err) { return console.log(err); });
        else
            return (alert("Error: getUserMedia not supported!"));
        this.created = true;
    };
    Microphone.prototype.getNodeObservable = function () {
        return this.nodeSubject;
    };
    return Microphone;
})();
/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
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
/// <reference path="../Controllers/PlayerController.ts"/>
var PlayerView = (function () {
    function PlayerView(playerController) {
        this.content = $("<div>", { class: "controls" });
        this.playerController = playerController;
    }
    PlayerView.prototype.render = function (el) {
        var _this = this;
        var mic = $("<a>", {
            href: "#",
            class: "mic"
        });
        var micIcon = $("<img>", {
            src: "./resources/ic_mic_none_white_48dp.png"
        });
        mic.append(micIcon);
        mic.click(function (e) {
            e.preventDefault();
            _this.playerController.onMicClick();
        });
        var soundcloud = $('<div>', { class: 'soundcloud', text: 'Soundcloud URL:' });
        var input = $("<input>", { class: 'soundcloud-input', type: 'text' });
        input.change(function () {
            console.log(input.val());
        });
        soundcloud.append(input);
        var audioPlayer = $("<audio />", { class: 'audio-player', controls: true });
        this.content.append(mic);
        this.content.append(soundcloud);
        this.content.append(audioPlayer);
        $(el).append(this.content);
    };
    return PlayerView;
})();
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
/// <reference path="PlayerView.ts"/>
/// <reference path="../Controllers/AudioController.ts"/>
var AppView = (function () {
    function AppView() {
        this.content = $("<div>", { text: "Hello, world!" });
        this.audioController = new AudioController();
        this.playerView = new PlayerView(this.audioController.getPlayerController());
    }
    AppView.prototype.render = function (el) {
        this.playerView.render(this.content[0]);
        $(el).append(this.content);
    };
    return AppView;
})();
/// <reference path="./typed/jquery.d.ts"/>
/// <reference path="./typed/rx.d.ts"/>
/// <reference path="./typed/waa.d.ts"/>
/// <reference path="Views/IControllerView.ts"/>
/// <reference path="Views/AppView.ts"/>
function exec() {
    "use strict";
    var app = new AppView();
    app.render($("#content")[0]);
}
$(document).ready(function () {
    exec();
});
