/// <reference path='../Models/Sources/VideoSource.ts'/>

class VideoController {
  private _videoManager: VideoSource;

  get Manager() {
    return this._videoManager;
  }

  constructor(videoManger: VideoSource) {
    this._videoManager = videoManger;
  }

  setVideoSource(videoElement: HTMLVideoElement) {
    this._videoManager.useVideoSource(videoElement);
  }
}
