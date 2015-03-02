var AudioShaderPlane = (function () {
    function AudioShaderPlane(audioManager) {
        this._shaderSubject = new Rx.Subject();
        this._meshSubject = new Rx.Subject();
        this.MeshObservable = this._meshSubject.asObservable();
        var uniformsManager = UniformsManager.fromPropertyProviders([audioManager]);
        this._shaderSubject.map(function (shader) {
            shader.uniforms = uniformsManager.uniforms;
            return shader;
        }).map(function (shader) { return new ShaderPlane(shader).mesh; }).subscribe(this._meshSubject);
    }
    AudioShaderPlane.prototype.onShader = function (shader) {
        this._shaderSubject.onNext(shader);
    };
    return AudioShaderPlane;
})();
