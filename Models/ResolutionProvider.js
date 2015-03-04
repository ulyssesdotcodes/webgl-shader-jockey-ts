var ResolutionProvider = (function () {
    function ResolutionProvider() {
        this._resolutionSubject = new Rx.Subject();
    }
    ResolutionProvider.prototype.glProperties = function () {
        return this._resolutionSubject.asObservable().map(function (resolution) { return [resolution]; });
    };
    ResolutionProvider.prototype.updateResolution = function (resolution) {
        this._resolutionSubject.onNext({
            name: function () {
                return "resolution";
            },
            type: function () {
                return "v2";
            },
            value: function () {
                return resolution;
            },
            uniform: function () {
                return { type: "v2", value: resolution };
            }
        });
    };
    return ResolutionProvider;
})();
