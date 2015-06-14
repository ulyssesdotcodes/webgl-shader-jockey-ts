/// <reference path="./GLView.ts"/>
/// <reference path="../Controllers/GLController.ts"/>
/// <reference path="./VideoView.ts"/>
/// <reference path="../Controllers/VideoController.ts"/>
/// <reference path="../Controllers/ControlsController.ts"/>
/// <reference path="./ControlsView.ts"/>
/// <reference path='./IControllerView.ts' />
/// <reference path="./VisualizationOptionsView.ts"/>
/// <reference path="../Controllers/VisualizationOptionsController.ts"/>
/// <reference path="../Models/VisualizationOption"/>
/// <reference path="../Models/Sources/MicSource"/>
/// <reference path="../Models/Sources/AudioSource"/>

module GLVis {
  export class MicInput implements IControllerView {
    private _visualizationManager: VisualizationManager;
    private _videoController: VideoController;
    private _visualizationOptionsController: VisualizationOptionsController;
    private _controlsController: ControlsController;
    private _glController: GLController;
    private _glView: GLView;
    private _shadersView: VisualizationOptionsView;
    private _videoView: VideoView;
    private _controlsView: ControlsView;
    content: JQuery;

    constructor(visualizationOptions: Array<VisualizationOption>, shadersUrl) {
      this.content = $("<div>");

      window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
      var audioSource = new MicSource(new AudioContext());
      var videoSource = new VideoSource();
      var resolutionProvider = new ResolutionProvider();
      var controlsProvider = new ControlsProvider();

      this._visualizationManager = new VisualizationManager(videoSource, audioSource, resolutionProvider, shadersUrl);

      // this._videoController = new VideoController(videoSource);
      this._visualizationOptionsController = new VisualizationOptionsController(visualizationOptions);
      this._controlsController = new ControlsController(controlsProvider);
      this._glController = new GLController(this._visualizationManager, this._visualizationOptionsController.VisualizationOptionObservable, resolutionProvider);

      this._glView = new GLView(this._glController);
      this._shadersView = new VisualizationOptionsView(this._visualizationOptionsController);
      this._controlsView = new ControlsView(this._controlsController);
      // this._videoView = new VideoView(this._videoController);
  }

    render(el: HTMLElement): void {
      this._glView.render(this.content[0]);
      this._shadersView.render(this.content[0]);
      this._controlsView.render(this.content[0]);
      // this._videoView.render(this.content[0]);
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
