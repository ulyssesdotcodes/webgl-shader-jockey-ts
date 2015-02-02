var PlayerView = (function () {
    function PlayerView() {
        this.content = $("<div>", { class: "controls" });
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
