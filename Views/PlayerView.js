var PlayerView = (function () {
    function PlayerView(playerController) {
        this.content = $("<div>", { class: "controls" });
        this.playerController = playerController;
    }
    PlayerView.prototype.render = function (el) {
        var _this = this;
        var soundcloud = $("<div>", { class: "soundcloud", text: "Soundcloud URL:" });
        this.input = $("<input>", { class: "soundcloud-input", type: "text" });
        this.input.change(function () { return _this.playerController.onUrl(_this.input.val()); });
        soundcloud.append(this.input);
        var mic = $("<a>", {
            href: "#",
            class: "mic-icon"
        });
        var micIcon = $("<img>", {
            src: "./resources/ic_mic_none_white_48dp.png",
            class: "icon"
        });
        mic.append(micIcon);
        mic.click(function (e) {
            e.preventDefault();
            _this.playerController.onMicClick();
            _this.audioPlayer.pause();
        });
        this.audioPlayer = document.createElement("audio");
        this.audioPlayer.setAttribute("class", "audio-player");
        this.audioPlayer.controls = true;
        this.playerController.getUrlObservable().subscribe(function (url) {
            _this.audioPlayer.setAttribute("src", url);
            _this.audioPlayer.play();
        });
        this.playerController.setPlayerSource(this.audioPlayer);
        this.content.append(mic);
        this.content.append(soundcloud);
        this.content.append(this.audioPlayer);
        $(el).append(this.content);
    };
    return PlayerView;
})();
