/// <reference path="../typed/soundcloud.d.ts" />
var SoundCloudLoader = (function () {
    function SoundCloudLoader() {
        this.urlSubject = new Rx.Subject();
        SC.initialize({
            client_id: SoundCloudLoader.CLIENT_ID
        });
    }
    SoundCloudLoader.prototype.getUrlObservable = function () {
        return this.urlSubject.asObservable();
    };
    SoundCloudLoader.prototype.loadStream = function (url) {
        var _this = this;
        if (!SC) {
            return; // No internet
        }
        SC.get('/resolve', { url: url, test: "two" }, function (sound) {
            if (sound.errors) {
                console.log("error: ", sound.errors);
                _this.urlSubject.onError("Invalid URL");
                return;
            }
            var url = sound.kind == 'playlist' ? sound.tracks[0].stream_url : sound.stream_url;
            _this.urlSubject.onNext(url + '?client_id=' + SoundCloudLoader.CLIENT_ID);
        });
    };
    SoundCloudLoader.CLIENT_ID = "384835fc6e109a2533f83591ae3713e9";
    return SoundCloudLoader;
})();
//# sourceMappingURL=SoundCloudLoader.js.map