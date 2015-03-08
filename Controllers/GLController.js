var GLController = (function () {
    function GLController(audioManager, videoManager) {
        var _this = this;
        this._meshSubject = new Rx.Subject();
        this.MeshObservable = this._meshSubject.asObservable();
        this._resolutionProvider = new ResolutionProvider();
        this._timeProvider = new TimeProvider();
        this._shaderLoader = new ShaderLoader();
        this._audioShaderPlane = new PropertiesShaderPlane([videoManager, this._resolutionProvider, this._timeProvider]);
        this._audioShaderPlane.MeshObservable.subscribe(function (mesh) { return _this.onNewMeshes([mesh]); });
    }
    GLController.prototype.onNewResolution = function (resolution) {
        this._resolutionProvider.updateResolution(new THREE.Vector2(resolution.width, resolution.height));
    };
    GLController.prototype.onNewMeshes = function (meshes) {
        this._meshSubject.onNext(meshes);
    };
    GLController.prototype.onShaderName = function (name) {
        var _this = this;
        this._shaderLoader.getShaderFromServer(name).subscribe(function (shader) { return _this._audioShaderPlane.onShaderText(shader); });
    };
    GLController.prototype.update = function () {
        this._timeProvider.updateTime();
    };
    return GLController;
})();
