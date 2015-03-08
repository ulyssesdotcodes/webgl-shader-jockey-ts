/// <reference path='../Models/VideoManager.ts'/>

class VideoController {
  private _videoManager: VideoManager;

  get Manager() {
    return this._videoManager;
  }

  constructor() {
    this._videoManager = new VideoManager();
  }

  setVideoSource(videoElement: HTMLVideoElement) {
    this._videoManager.updateVideoElement(videoElement);
  }

  sampleVideo() {
    this._videoManager.sampleVideo();
  }
}
