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
/// <reference path='../Models/AudioManager.ts' />

class FileVisualizer implements IControllerView {
  private _audioManager: AudioManager;
  private _playerController: PlayerController;
  private _videoController: VideoController;
  private _shadersController: ShadersController;
  private _controlsController: ControlsController;
  private _glController: GLController;
  private _glView: GLView;
  private _shadersView: ShadersView;
  private _videoView: VideoView;
  private _controlsView: ControlsView;
  playerView: PlayerView;
  content: JQuery;

  constructor(urls: Array<string>) {
    this.content = $("<div>", { text: "Hello, world!" });

    window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
    this._audioManager = new AudioManager(new AudioContext());

    this._playerController = new PlayerController(urls, audioManager);
    this._videoController = new VideoController();
    this._shadersController = new ShadersController();
    this._controlsController = new ControlsController();
    this._glController = new GLController(this._audioManager,
      this._videoController.Manager, this._controlsController.UniformsProvider);

    this.playerView = new PlayerView(this._playerController);
    this._glView = new GLView(this._playerController.manager, this._glController);
    this._shadersView = new ShadersView(this._shadersController);
    this._controlsView = new ControlsView(this._controlsController);
    this._videoView = new VideoView(this._videoController);

    this._shadersController.ShaderNameObservable.subscribe((name) =>
      this._glController.onShaderName(name))
  }

  render(el: HTMLElement): void {
    this.playerView.render(this.content[0]);
    this._glView.render(this.content[0]);
    this._shadersView.render(this.content[0]);
    this._controlsView.render(this.content[0]);
    this._videoView.render(this.content[0]);
    $(el).append(this.content);

    requestAnimationFrame(() => this.animate());
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    this._audioManager.sampleAudio();
    this._videoController.sampleVideo();
    this._glView.animate();
  }
}
