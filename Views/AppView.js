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
//# sourceMappingURL=AppView.js.map