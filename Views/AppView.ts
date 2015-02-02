/// <reference path="PlayerView.ts"/>

class AppView implements IControllerView {
  playerView: PlayerView;
  content: JQuery;

  constructor() {
    this.content = $("<div>", { text: "Hello, world!" });
    this.playerView = new PlayerView();
  }

  render(el: HTMLElement): void {
    this.playerView.render(this.content[0]);
    $(el).append(this.content);
  }
}
