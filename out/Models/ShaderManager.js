/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/three.d.ts"/>
var ShaderManager = (function () {
    function ShaderManager(propertiesProviders) {
        var _this = this;
        this._uniforms = {};
        Rx.Observable.merge(Rx.Observable.from(propertiesProviders).flatMap(function (provider) {
            return provider.glProperties();
        }).flatMap(function (properties) { return Rx.Observable.from(properties); })).subscribe(function (property) {
            property.addToGL(_this._uniforms);
        });
    }
    ShaderManager.prototype.applyUniforms = function (shader) {
        shader.uniforms = this._uniforms;
        return shader;
    };
    return ShaderManager;
})();
//# sourceMappingURL=ShaderManager.js.map