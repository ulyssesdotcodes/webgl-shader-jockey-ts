var Microphone = (function () {
    function Microphone() {
        this.created = false;
        this.nodeSubject = new Rx.Subject();
    }
    Microphone.prototype.emitNode = function (audioContext) {
        var _this = this;
        if (this.created) {
            this.nodeSubject.onNext(this.node);
            return;
        }
        var gotStream = function (stream) {
            _this.node = audioContext.createMediaStreamSource(stream);
            _this.nodeSubject.onNext(_this.node);
        };
        if (navigator.getUserMedia)
            navigator.getUserMedia({ audio: true, video: false }, gotStream, function (err) { return console.log(err); });
        else if (navigator.webkitGetUserMedia)
            navigator.webkitGetUserMedia({ audio: true, video: false }, gotStream, function (err) { return console.log(err); });
        else if (navigator.mozGetUserMedia)
            navigator.mozGetUserMedia({ audio: true, video: false }, gotStream, function (err) { return console.log(err); });
        else
            return (alert("Error: getUserMedia not supported!"));
        this.created = true;
    };
    Microphone.prototype.getNodeObservable = function () {
        return this.nodeSubject;
    };
    return Microphone;
})();
//# sourceMappingURL=Microphone.js.map