/// <reference path='../Models/VideoManager.ts'/>

class VideoController {
  private _videoManager: VideoManager;

  get Manager() {
    return this._videoManager;
  }

  constructor(videoManger: VideoManager) {
    this._videoManager = videoManger;
  }

  setVideoSource(videoElement: HTMLVideoElement) {
    this._videoManager.updateVideoElement(videoElement);
  }
}
