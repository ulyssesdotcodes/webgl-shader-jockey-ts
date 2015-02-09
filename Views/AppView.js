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
