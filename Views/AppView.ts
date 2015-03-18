/// <reference path="./PlayerView.ts"/>
/// <reference path="../Controllers/PlayerController.ts"/>
/// <reference path="./GLView.ts"/>
/// <reference path="../Controllers/GLController.ts"/>
/// <reference path="./ShadersView.ts"/>
/// <reference path="./VideoView.ts"/>
/// <reference path="../Controllers/VideoController.ts"/>
/// <reference path="../Controllers/ControlsController.ts"/>
/// <reference path="./ControlsView.ts"/>
/// <reference path='./IControllerView.ts' />
/// <reference path="../Controllers/PopupWindowController.ts"/>
/// <reference path='./PopupWindowView.ts' />

class AppView implements IControllerView {
  private _playerController: PlayerController;
  private _videoController: VideoController;
  private _shadersController: ShadersController;
  private _controlsController: ControlsController;
  private _glController: GLController;
  private _popupWindowController: PopupWindowController;
  private _glView: GLView;
  private _shadersView: ShadersView;
  private _videoView: VideoView;
  private _popupWindowView: PopupWindowView;
  private _controlsView: ControlsView;
  playerView: PlayerView;
  content: JQuery;

  constructor() {
    this.content = $("<div>", { text: "Hello, world!" });

    this._playerController = new PlayerController();
    this._videoController = new VideoController();
    this._shadersController = new ShadersController();
    this._controlsController = new ControlsController();
    this._glController = new GLController(this._playerController.manager,
      this._videoController.Manager, this._controlsController.UniformsProvider);

    this._popupWindowController = new PopupWindowController();

    this.playerView = new PlayerView(this._playerController);
    this._glView = new GLView(this._playerController.manager, this._glController);
    this._shadersView = new ShadersView(this._shadersController);
    this._controlsView = new ControlsView(this._controlsController);
    this._videoView = new VideoView(this._videoController);
    this._popupWindowView = new PopupWindowView(this._popupWindowController);

    this._shadersController.ShaderNameObservable.subscribe((name) =>
      this._glController.onShaderName(name))
  }

  render(el: HTMLElement): void {
    // this.playerView.render(this.content[0]);
    this._glView.render(this.content[0]);
    this._shadersView.render(this.content[0]);
    this._controlsView.render(this.content[0]);
    this._videoView.render(this.content[0]);
    this._popupWindowView.render(this.content[0]);
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
