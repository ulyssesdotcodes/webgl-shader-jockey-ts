var UniformsManager = (function () {
    function UniformsManager(propertiesProviders) {
        this._uniformsSubject = new Rx.Subject();
        this.UniformsObservable = this._uniformsSubject.asObservable();
        this._propertiesProviders = propertiesProviders;
    }
    UniformsManager.prototype.calculateUniforms = function () {
        var _this = this;
        Rx.Observable.from(this._propertiesProviders).flatMap(function (provider) { return provider.glProperties(); }).scan({}, function (acc, properties) {
            properties.forEach(function (property) { return acc[property.name] = property; });
            return acc;
        }).subscribe(function (properties) { return _this._uniformsSubject.onNext(properties); });
    };
    return UniformsManager;
})();
