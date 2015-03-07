var ShadersController = (function () {
    function ShadersController() {
        this._shaderNameSubject = new Rx.Subject();
        this.ShaderNameObservable = this._shaderNameSubject.asObservable();
    }
    ShadersController.prototype.onShaderName = function (shaderName) {
        this._shaderNameSubject.onNext(shaderName);
    };
    return ShadersController;
})();
