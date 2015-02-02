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
