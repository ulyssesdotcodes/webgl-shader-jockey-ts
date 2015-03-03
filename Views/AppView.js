var AppView = (function () {
    function AppView() {
        this.content = $("<div>", { text: "Hello, world!" });
        this._playerController = new PlayerController();
        this.playerView = new PlayerView(this._playerController);
        this._glView = new GLView(this._playerController.manager);
    }
    AppView.prototype.render = function (el) {
        var _this = this;
        this.playerView.render(this.content[0]);
        this._glView.render(this.content[0]);
        $(el).append(this.content);
        requestAnimationFrame(function () { return _this.animate(); });
    };
    AppView.prototype.animate = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.animate(); });
        this._playerController.sampleAudio();
        this._glView.animate();
    };
    return AppView;
})();
