var GLController = (function () {
    function GLController(audioManager) {
        this._uniformsManager = UniformsManager.fromPropertyProviders([audioManager]);
        this._meshSubject = new Rx.Subject();
        this.MeshObservable = this._meshSubject.asObservable();
    }
    GLController.prototype.onNewMeshes = function (meshes) {
        this._meshSubject.onNext(meshes);
    };
    GLController.prototype.fromAudioManager = function (audioManager) {
        var controller = new GLController(audioManager);
        var audioShaderPlane = new AudioShaderPlane(audioManager);
        audioShaderPlane.MeshObservable.subscribe(function (mesh) { return controller.onNewMeshes([mesh]); });
    };
    return GLController;
})();
