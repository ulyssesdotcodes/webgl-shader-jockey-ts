/// <reference path="PlayerView.ts"/>
/// <reference path="../Controllers/PlayerController.ts"/>
var AppView = (function () {
    function AppView() {
        this.content = $("<div>", { text: "Hello, world!" });
        this._playerController = new PlayerController();
        this.playerView = new PlayerView(this._playerController);
    }
    AppView.prototype.render = function (el) {
        var _this = this;
        this.playerView.render(this.content[0]);
        $(el).append(this.content);
        requestAnimationFrame(function () { return _this.animate(); });
    };
    AppView.prototype.animate = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.animate(); });
        this._playerController.sampleAudio();
    };
    return AppView;
})();
//# sourceMappingURL=AppView.js.map