var TimeProperty = (function () {
    function TimeProperty(time) {
        this._name = "time";
        this._type = "f";
        this._time = time;
    }
    TimeProperty.prototype.name = function () {
        return this._name;
    };
    TimeProperty.prototype.type = function () {
        return this._type;
    };
    TimeProperty.prototype.value = function () {
        return this._time;
    };
    TimeProperty.prototype.uniform = function () {
        return { type: this.type(), value: this.value() };
    };
    return TimeProperty;
})();
