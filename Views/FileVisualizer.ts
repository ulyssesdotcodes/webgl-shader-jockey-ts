/// <reference path="./PlayerView.ts"/>
/// <reference path="./PlaylistView.ts"/>
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
/// <reference path='../Models/Track.ts' />

class FileVisualizer implements IControllerView {
  private _audioManager: AudioManager;
  private _playerController: PlayerController;
  private _shadersController: ShadersController;
  private _glController: GLController;
  private _glView: GLView;
  private _shadersView: ShadersView;
  private _playerView: PlayerView;
  private _playlistView: PlaylistView;
  content: JQuery;

  constructor(tracks: Array<Track>) {
    this.content = $("<div>", { text: "Hello, world!" });

    window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
    this._audioManager = new AudioManager(new AudioContext());

    this._playerController = new PlayerController(tracks, this._audioManager);
    this._shadersController = new ShadersController();
    this._glController = new GLController(this._audioManager, null, null);

    this._playerView = new PlayerView(this._playerController);
    this._playlistView = new PlaylistView(this._playerController);
    this._glView = new GLView(this._playerController.manager, this._glController);
    this._shadersView = new ShadersView(this._shadersController);

    this._shadersController.ShaderNameObservable.subscribe((name) =>
      this._glController.onShaderName(name))
  }

  render(el: HTMLElement): void {
    this._playerView.render(this.content[0]);
    this._playlistView.render(this.content[0]);
    this._glView.render(this.content[0]);
    this._shadersView.render(this.content[0]);
    $(el).append(this.content);

    requestAnimationFrame(() => this.animate());
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    this._audioManager.sampleAudio();
    this._glView.animate();
  }
}
