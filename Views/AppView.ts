/// <reference path="./PlayerView.ts"/>
/// <reference path="../Controllers/PlayerController.ts"/>
/// <reference path="./GLView.ts"/>
/// <reference path="../Controllers/GLController.ts"/>
/// <reference path="./ShadersView.ts"/>
/// <reference path="./VideoView.ts"/>
/// <reference path="../Controllers/VideoController.ts"/>
/// <reference path='./IControllerView.ts' />

class AppView implements IControllerView {
  private _playerController: PlayerController;
  private _videoController: VideoController;
  private _shadersController: ShadersController;
  private _glController: GLController;
  private _glView: GLView;
  private _shadersView: ShadersView;
  private _videoView: VideoView;
  playerView: PlayerView;
  content: JQuery;

  constructor() {
    this.content = $("<div>", { text: "Hello, world!" });

    this._playerController = new PlayerController();
    this._videoController = new VideoController();
    this._shadersController = new ShadersController();
    this._glController = new GLController(this._playerController.manager,
      this._videoController.Manager);

    this.playerView = new PlayerView(this._playerController);
    this._glView = new GLView(this._playerController.manager, this._glController);
    this._shadersView = new ShadersView(this._shadersController);
    this._videoView = new VideoView(this._videoController);

    this._shadersController.ShaderNameObservable.subscribe((name) =>
      this._glController.onShaderName(name))
  }

  render(el: HTMLElement): void {
    this.playerView.render(this.content[0]);
    this._glView.render(this.content[0]);
    this._shadersView.render(this.content[0]);
    this._videoView.render(this.content[0]);
    $(el).append(this.content);

    requestAnimationFrame(() => this.animate());
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    this._playerController.sampleAudio();
    this._videoController.sampleVideo();
    this._glView.animate();
  }
}
