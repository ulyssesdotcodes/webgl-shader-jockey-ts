/// <reference path="PlayerView.ts"/>
/// <reference path="../Controllers/PlayerController.ts"/>

class AppView implements IControllerView {
  private _playerController: PlayerController;
  playerView: PlayerView;
  content: JQuery;

  constructor() {
    this.content = $("<div>", { text: "Hello, world!" });

    this._playerController = new PlayerController();

    this.playerView = new PlayerView(this._playerController);
  }

  render(el: HTMLElement): void {
    this.playerView.render(this.content[0]);
    $(el).append(this.content);

    requestAnimationFrame(() => this.animate());
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    this._playerController.sampleAudio();
  }
}
