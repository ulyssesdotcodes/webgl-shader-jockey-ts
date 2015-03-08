var VideoShaderPlane = (function () {
    function VideoShaderPlane(videoManager, additionalProperties) {
        this._videoManager = videoManager;
        this._uniformsManager = new UniformsManager(additionalProperties.concat([videoManager]));
    }
    return VideoShaderPlane;
})();
