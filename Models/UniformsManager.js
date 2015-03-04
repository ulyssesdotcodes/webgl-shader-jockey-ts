var UniformsManager = (function () {
    function UniformsManager() {
        this._uniforms = {};
    }
    Object.defineProperty(UniformsManager.prototype, "uniforms", {
        get: function () {
            return this._uniforms;
        },
        enumerable: true,
        configurable: true
    });
    UniformsManager.fromPropertyProviders = function (propertiesProviders) {
        var uniformsManager = new UniformsManager();
        Rx.Observable.merge(Rx.Observable.from(propertiesProviders).flatMap(function (provider) { return provider.glProperties(); }).flatMap(function (properties) { return Rx.Observable.from(properties); })).subscribe(function (property) { return uniformsManager.createOrUpdateUniform(property); });
        return uniformsManager;
    };
    UniformsManager.prototype.createOrUpdateUniform = function (property) {
        this._uniforms[property.name()] = property.uniform();
    };
    return UniformsManager;
})();
