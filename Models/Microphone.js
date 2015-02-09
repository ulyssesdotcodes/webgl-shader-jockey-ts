var Microphone = (function () {
    function Microphone() {
        this.created = false;
        this.nodeSubject = new Rx.Subject();
    }
    Microphone.prototype.emitNode = function (audioContext) {
        if (this.created) {
            this.nodeSubject.onNext(this.node);
            return;
        }
        var gotStream = function (stream) {
            this.node = audioContext.createMediaStreamSource(stream);
            this.nodeSubject.onNext(node);
        };
        if (navigator.getUserMedia)
            navigator.getUserMedia({ audio: true }, gotStream, function (err) { return console.log(err); });
        else if (navigator.webkitGetUserMedia)
            navigator.webkitGetUserMedia({ audio: true }, gotStream, function (err) { return console.log(err); });
        else if (navigator.mozGetUserMedia)
            navigator.mozGetUserMedia({ audio: true }, gotStream, function (err) { return console.log(err); });
        else
            return (alert("Error: getUserMedia not supported!"));
    };
    Microphone.prototype.getNode = function () {
        return this.node;
    };
    return Microphone;
})();
