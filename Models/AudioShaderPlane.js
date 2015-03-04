var AudioShaderPlane = (function () {
    function AudioShaderPlane(audioManager, additionalProperties) {
        this._shaderSubject = new Rx.Subject();
        this._meshSubject = new Rx.Subject();
        this.MeshObservable = this._meshSubject.asObservable();
        var uniformsManager = UniformsManager.fromPropertyProviders(additionalProperties.concat([audioManager]));
        this._shaderSubject.map(function (shaderText) {
            return new THREE.ShaderMaterial({
                uniforms: uniformsManager.uniforms,
                fragmentShader: shaderText.fragmentShader,
                vertexShader: shaderText.vertextShader
            });
        }).map(function (shader) { return new ShaderPlane(shader).mesh; }).subscribe(this._meshSubject);
    }
    AudioShaderPlane.prototype.onShaderText = function (shader) {
        this._shaderSubject.onNext(shader);
    };
    return AudioShaderPlane;
})();
