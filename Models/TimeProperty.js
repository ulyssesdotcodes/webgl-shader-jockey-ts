var TimeProperty = (function () {
    function TimeProperty(time) {
        this._name = "time";
        this.time = time;
    }
    TimeProperty.prototype.getName = function () {
        return this._name;
    };
    TimeProperty.prototype.addToGL = function (uniforms) {
        uniforms.time = {
            type: "f",
            value: this.time
        };
        return uniforms;
    };
    return TimeProperty;
})();
//# sourceMappingURL=TimeProperty.js.map