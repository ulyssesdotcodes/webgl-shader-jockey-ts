/// <reference path="./PlayerView.ts"/>
/// <reference path="./PlaylistView.ts"/>
/// <reference path="../Controllers/PlayerController.ts"/>
/// <reference path="./GLView.ts"/>
/// <reference path="../Controllers/GLController.ts"/>
/// <reference path="./VideoView.ts"/>
/// <reference path="../Controllers/VideoController.ts"/>
/// <reference path="../Controllers/ControlsController.ts"/>
/// <reference path="./ControlsView.ts"/>
/// <reference path="../Controllers/VisualizationOptionsController.ts"/>
/// <reference path="./VisualizationOptionsView.ts"/>
/// <reference path="./ControlsView.ts"/>
/// <reference path='./IControllerView.ts' />
/// <reference path='../Models/AudioSource.ts' />
/// <reference path='../Models/Track.ts' />
/// <reference path="../Models/VisualizationOption"/>

module GLVis {
  export class FileInput implements IControllerView {
    private _visualizationManager: VisualizationManager;
    private _playerController: PlayerController;
    private _visualizationOptionsController: VisualizationOptionsController;
    private _glController: GLController;
    private _glView: GLView;
    private _visualizationOptionsView: VisualizationOptionsView;
    private _playerView: PlayerView;
    private _playlistView: PlaylistView;
    content: JQuery;

    constructor(tracks: Array<Track>, shaders: Array<VisualizationOption>, shaderUrl) {
      this.content = $("<div>");

      window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
      var audioSource = new AudioSource(new AudioContext());
      var resolutionProvider = new ResolutionProvider();
      this._visualizationManager = new VisualizationManager(audioSource, resolutionProvider, shaderUrl)

      this._playerController = new PlayerController(tracks, audioSource);
      this._visualizationOptionsController = new VisualizationOptionsController(shaders);
      this._glController =
      new GLController(this._visualizationManager, this._visualizationOptionsController.VisualizationOptionObservable, resolutionProvider);

      this._playerView = new PlayerView(this._playerController);
      this._playlistView = new PlaylistView(this._playerController);
      this._glView = new GLView(this._glController);
      this._visualizationOptionsView = new VisualizationOptionsView(this._visualizationOptionsController);
    }

    render(el: HTMLElement): void {
      this._playerView.render(this.content[0]);
      this._playlistView.render(this.content[0]);
      this._glView.render(this.content[0]);
      this._visualizationOptionsView.render(this.content[0]);
      $(el).append(this.content);

      requestAnimationFrame(() => this.animate());
    }

    animate(): void {
      requestAnimationFrame(() => this.animate());
      this._visualizationManager.animate();
      this._glView.animate();
    }
  }
}
