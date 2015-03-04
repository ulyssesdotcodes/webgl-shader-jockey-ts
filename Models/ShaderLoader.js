var ShaderLoader = (function () {
    function ShaderLoader() {
    }
    ShaderLoader.prototype.getShaderFromServer = function (name) {
        return Rx.Observable.combineLatest(this.getFragment(name), this.getVertex(name), function (frag, vert) { return new ShaderText(frag, vert); });
    };
    ShaderLoader.prototype.getVertex = function (name) {
        return $.getAsObservable('/shaders/' + name + ".vert").map(function (shader) { return shader.data; });
    };
    ShaderLoader.prototype.getFragment = function (name) {
        return $.getAsObservable('/shaders/' + name + '.frag').map(function (shader) { return shader.data; });
    };
    return ShaderLoader;
})();
