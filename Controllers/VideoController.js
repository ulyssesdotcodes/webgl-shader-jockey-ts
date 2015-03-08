var VideoController = (function () {
    function VideoController() {
        this._videoManager = new VideoManager();
    }
    Object.defineProperty(VideoController.prototype, "Manager", {
        get: function () {
            return this._videoManager;
        },
        enumerable: true,
        configurable: true
    });
    VideoController.prototype.setVideoSource = function (videoElement) {
        this._videoManager.updateVideoElement(videoElement);
    };
    VideoController.prototype.sampleVideo = function () {
        this._videoManager.sampleVideo();
    };
    return VideoController;
})();
