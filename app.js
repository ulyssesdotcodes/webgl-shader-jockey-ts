var Microphone = (function () {
    function Microphone() {
        this.created = false;
        this.nodeSubject = new Rx.Subject();
    }
    Microphone.prototype.emitNode = function (audioContext) {
        if (this.created) {
            this.nodeSubject.onNext(this.node);
            return;
        }
        var gotStream = function (stream) {
            this.node = audioContext.createMediaStreamSource(stream);
            this.nodeSubject.onNext(node);
        };
        if (navigator.getUserMedia)
            navigator.getUserMedia({ audio: true }, gotStream, function (err) { return console.log(err); });
        else if (navigator.webkitGetUserMedia)
            navigator.webkitGetUserMedia({ audio: true }, gotStream, function (err) { return console.log(err); });
        else if (navigator.mozGetUserMedia)
            navigator.mozGetUserMedia({ audio: true }, gotStream, function (err) { return console.log(err); });
        else
            return (alert("Error: getUserMedia not supported!"));
    };
    Microphone.prototype.getNode = function () {
        return this.node;
    };
    return Microphone;
})();
/// <reference path="../Models/Microphone.ts"/>
var PlayerController = (function () {
    function PlayerController() {
        this.microphone = new Microphone();
    }
    PlayerController.prototype.onMicClick = function () {
        this.microphone.emitNode();
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
            this.playerController.onMicClick();
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
/// <reference path="PlayerView.ts"/>
var AppView = (function () {
    function AppView() {
        this.content = $("<div>", { text: "Hello, world!" });
        this.playerController = new PlayerController();
        this.playerView = new PlayerView(this.playerController);
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
