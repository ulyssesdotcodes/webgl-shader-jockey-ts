/// <reference path="./PlayerView.ts"/>
/// <reference path="../Controllers/PlayerController.ts"/>
/// <reference path="./GLView.ts"/>
/// <reference path="../Controllers/GLController.ts"/>
/// <reference path='./IControllerView.ts' />

class AppView implements IControllerView {
  private _playerController: PlayerController;
  private _glView: GLView;
  playerView: PlayerView;
  content: JQuery;

  constructor() {
    this.content = $("<div>", { text: "Hello, world!" });

    this._playerController = new PlayerController();

    this.playerView = new PlayerView(this._playerController);
    this._glView = new GLView(this._playerController.manager);
  }

  render(el: HTMLElement): void {
    this.playerView.render(this.content[0]);
    this._glView.render(this.content[0]);
    $(el).append(this.content);

    requestAnimationFrame(() => this.animate());
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    this._playerController.sampleAudio();
    this._glView.animate();
  }
}
