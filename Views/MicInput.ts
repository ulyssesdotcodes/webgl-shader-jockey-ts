/// <reference path="../Controllers/MicrophoneController.ts"/>
/// <reference path="./GLView.ts"/>
/// <reference path="../Controllers/GLController.ts"/>
/// <reference path="./ShadersView.ts"/>
/// <reference path="./VideoView.ts"/>
/// <reference path="../Controllers/VideoController.ts"/>
/// <reference path="../Controllers/ControlsController.ts"/>
/// <reference path="./ControlsView.ts"/>
/// <reference path='./IControllerView.ts' />
/// <reference path='../Models/AudioManager.ts' />
/// <reference path='../Models/VideoManager.ts' />
/// <reference path='../Models/Shader.ts' />

module GLVis {
  export class MicInput implements IControllerView {
    private _audioManager: AudioManager;
    private _videoManager: VideoManager;
    private _videoController: VideoController;
    private _shadersController: ShadersController;
    private _controlsController: ControlsController;
    private _glController: GLController;
    private _glView: GLView;
    private _shadersView: ShadersView;
    private _videoView: VideoView;
    private _controlsView: ControlsView;
    content: JQuery;

    constructor(shaders: Array<Shader>, shadersUrl) {
      this.content = $("<div>");

      window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
      this._audioManager = new AudioManager(new AudioContext());
      this._videoManager = new VideoManager();

      var micController = new MicrophoneController(this._audioManager);
      this._videoController = new VideoController(this._videoManager);
      this._shadersController = new ShadersController(shaders);
      this._controlsController = new ControlsController();
      this._glController = new GLController(this._audioManager,
        this._videoController.Manager, this._controlsController.UniformsProvider, shadersUrl);

      this._glView = new GLView(this._audioManager, this._glController);
      this._shadersView = new ShadersView(this._shadersController);
      this._controlsView = new ControlsView(this._controlsController);
      this._videoView = new VideoView(this._videoController);

      this._shadersController.ShaderUrlObservable.subscribe((url) =>
        this._glController.onShaderUrl(url))

      this._glController.onShaderUrl(shaders[0].url);
  }

    render(el: HTMLElement): void {
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
      this._videoManager.sampleVideo();
      this._glView.animate();
    }
  }
}
