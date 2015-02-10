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
