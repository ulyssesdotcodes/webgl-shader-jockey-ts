var TimeProvider = (function () {
    function TimeProvider() {
        this._startTime = Date.now();
        this._timeProperty = {
            name: "time",
            type: "f",
            value: 0.0
        };
    }
    TimeProvider.prototype.glProperties = function () {
        return Rx.Observable.just([this._timeProperty]);
    };
    TimeProvider.prototype.updateTime = function () {
        this._timeProperty.value = (this._startTime - Date.now()) / 1000.0;
    };
    return TimeProvider;
})();
