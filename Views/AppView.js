var AppView = (function () {
    function AppView() {
        var _this = this;
        this.content = $("<div>", { text: "Hello, world!" });
        this._playerController = new PlayerController();
        this._shadersController = new ShadersController();
        this._glController = new GLController(this._playerController.manager);
        this.playerView = new PlayerView(this._playerController);
        this._glView = new GLView(this._playerController.manager, this._glController);
        this._shadersView = new ShadersView(this._shadersController);
        this._shadersController.ShaderNameObservable.subscribe(function (name) { return _this._glController.onShaderName(name); });
    }
    AppView.prototype.render = function (el) {
        var _this = this;
        this.playerView.render(this.content[0]);
        this._shadersView.render(this.content[0]);
        $(el).append(this.content);
        this._glView.render(this.content[0]);
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
