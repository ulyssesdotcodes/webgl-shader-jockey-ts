var GLController = (function () {
    function GLController(audioManager) {
        var _this = this;
        this._uniformsManager = new UniformsManager([audioManager]);
        this._meshSubject = new Rx.Subject();
        this.MeshObservable = this._meshSubject.asObservable();
        this._resolutionProvider = new ResolutionProvider();
        this._shaderLoader = new ShaderLoader();
        this._audioShaderPlane = new AudioShaderPlane(audioManager, [this._resolutionProvider]);
        this._audioShaderPlane.MeshObservable.subscribe(function (mesh) { return _this.onNewMeshes([mesh]); });
    }
    GLController.fromAudioManager = function (audioManager) {
        var controller = new GLController(audioManager);
    };
    GLController.prototype.onNewResolution = function (resolution) {
        this._resolutionProvider.updateResolution(new THREE.Vector2(resolution.width, resolution.height));
    };
    GLController.prototype.onNewMeshes = function (meshes) {
        this._meshSubject.onNext(meshes);
    };
    GLController.prototype.onShaderName = function (name) {
        var _this = this;
        this._shaderLoader.getShaderFromServer("simple").subscribe(function (shader) { return _this._audioShaderPlane.onShaderText(shader); });
    };
    return GLController;
})();
