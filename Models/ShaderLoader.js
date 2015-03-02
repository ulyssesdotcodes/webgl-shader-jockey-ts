var ShaderLoader = (function () {
    function ShaderLoader() {
    }
    ShaderLoader.getShaderFromServer = function (name) {
        return Rx.Observable.combineLatest(ShaderLoader.getVertex(name), ShaderLoader.getFragment(name), function (frag, vert) { return new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: frag
        }); });
    };
    ShaderLoader.getVertex = function (name) {
        return $.ajaxAsObservable({
            url: '/shaders/' + name
        }).map(function (shader) { return shader.responseText; });
    };
    ShaderLoader.getFragment = function (name) {
        return $.ajaxAsObservable({
            url: '/shaders/' + name + '.frag'
        }).map(function (shader) { return shader.responseText; });
    };
    return ShaderLoader;
})();
