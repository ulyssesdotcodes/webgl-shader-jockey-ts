var PlayerView = (function () {
    function PlayerView() {
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
            console.log("Start mic");
        });
        $(el).append(mic);
    };
    return PlayerView;
})();
/// <reference path="PlayerView.ts"/>
var AppView = (function () {
    function AppView() {
        this.content = $("<div>", { text: "Hello, world!" });
        this.playerView = new PlayerView();
    }
    AppView.prototype.render = function (el) {
        this.playerView.render(this.content[0]);
        $(el).append(this.content);
    };
    return AppView;
})();
/// <reference path="./typed/jquery.d.ts"/>
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
