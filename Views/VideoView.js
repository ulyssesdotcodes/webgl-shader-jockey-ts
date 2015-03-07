var VideoView = (function () {
    function VideoView() {
        this._video = document.createElement("video");
        this._video.setAttribute("class", "camera");
        this._video.setAttribute("autoplay", "true");
        navigator["getUserMedia"] = navigator["getUserMedia"] || navigator["webkitGetUserMedia"] || navigator["mozGetUserMedia"];
        window["URL"] = window["URL"] || window["webkitURL"];
    }
    VideoView.prototype.render = function (el) {
        var _this = this;
        var gotStream = function (stream) {
            if (window["URL"]) {
                _this._video.src = window["URL"].createObjectURL(stream);
            }
            else {
                _this._video.src = stream;
            }
            _this._video.onerror = function (e) {
                stream.stop();
            };
        };
        navigator["getUserMedia"]({ audio: false, video: true }, gotStream, console.log);
        $(el).append(this._video);
    };
    return VideoView;
})();
