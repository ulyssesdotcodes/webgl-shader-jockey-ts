/// <reference path="PlayerView.ts"/>

class AppView implements IControllerView {
  playerView: PlayerView;
  playerController: PlayerController;
  content: JQuery;

  constructor() {
    this.content = $("<div>", { text: "Hello, world!" });
    this.playerController = new PlayerController();
    this.playerView = new PlayerView(this.playerController);
  }

  render(el: HTMLElement): void {
    this.playerView.render(this.content[0]);
    $(el).append(this.content);
  }
}
