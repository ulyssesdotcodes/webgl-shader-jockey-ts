var AudioShaderPlane = (function () {
    function AudioShaderPlane(audioManager, additionalProperties) {
        this._shaderSubject = new Rx.Subject();
        this._meshSubject = new Rx.Subject();
        this.MeshObservable = this._meshSubject.asObservable();
        this._uniformsManager = new UniformsManager(additionalProperties.concat([audioManager]));
        Rx.Observable.combineLatest(this._shaderSubject, this._uniformsManager.UniformsObservable, function (shaderText, uniforms) { return new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: shaderText.fragmentShader,
            vertexShader: shaderText.vertextShader
        }); }).map(function (shader) { return new ShaderPlane(shader).mesh; }).subscribe(this._meshSubject);
    }
    AudioShaderPlane.prototype.onShaderText = function (shader) {
        this._uniformsManager.calculateUniforms();
        this._shaderSubject.onNext(shader);
    };
    return AudioShaderPlane;
})();
