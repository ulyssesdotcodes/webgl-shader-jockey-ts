/// <reference path="PlayerView.ts"/>
/// <reference path="../Controllers/AudioController.ts"/>

class AppView implements IControllerView {
  private audioController: AudioController;
  playerView: PlayerView;
  content: JQuery;

  constructor() {
    this.content = $("<div>", { text: "Hello, world!" });

    this.audioController = new AudioController();

    this.playerView = new PlayerView(this.audioController.getPlayerController());
  }

  render(el: HTMLElement): void {
    this.playerView.render(this.content[0]);
    $(el).append(this.content);
  }
}
