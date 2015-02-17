var AudioManager = (function () {
    function AudioManager(audioContext) {
        var _this = this;
        this.audioNodeSubject = new Rx.Subject();
        this.audioContext = audioContext;
        this.audioNodeSubject.subscribe(function (node) { return _this.audioAnalyser = new AudioAnalyser(node, AudioManager.FFT_SIZE); });
        this.renderTimeObservable = new Rx.Subject();
    }
    AudioManager.prototype.updateSourceNode = function (sourceNode) {
        this.audioNodeSubject.onNext(sourceNode);
    };
    AudioManager.prototype.getAudioNodeObservable = function () {
        return this.audioNodeSubject.asObservable();
    };
    AudioManager.prototype.getContext = function () {
        return this.audioContext;
    };
    AudioManager.prototype.getGLPropertiesObservable = function () {
        return this.renderTimeObservable.map(function (time) { return new TimeProperty(time); }).map(this.arrayFromIGLProperties);
    };
    AudioManager.prototype.arrayFromIGLProperties = function (timeProperty) {
        var props = new Array();
        props.push(timeProperty);
        return props;
    };
    AudioManager.prototype.sampleAudio = function () {
        this.renderTimeObservable.onNext(this.audioContext.currentTime);
    };
    AudioManager.FFT_SIZE = 512;
    return AudioManager;
})();
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
            return;
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
var PlayerController = (function () {
    function PlayerController(manager) {
        var _this = this;
        this.manager = manager;
        this.microphone = new Microphone();
        this.microphone.getNodeObservable().subscribe(function (node) { return _this.manager.updateSourceNode(node); });
        this.soundCloudLoader = new SoundCloudLoader();
    }
    PlayerController.prototype.onMicClick = function () {
        this.microphone.emitNode(this.manager.getContext());
    };
    PlayerController.prototype.onUrl = function (url) {
        this.soundCloudLoader.loadStream(url);
        this.manager.updateSourceNode(this.playerSource);
    };
    PlayerController.prototype.setPlayerSource = function (source) {
        this.playerSource = this.manager.getContext().createMediaElementSource(source);
    };
    PlayerController.prototype.getUrlObservable = function () {
        return this.soundCloudLoader.getUrlObservable();
    };
    return PlayerController;
})();
var SpeakerController = (function () {
    function SpeakerController(manager) {
        var _this = this;
        this.manager = manager;
        manager.getAudioNodeObservable().subscribe(function (node) { return _this.connectToSpeakers(node); });
    }
    SpeakerController.prototype.connectToSpeakers = function (node) {
        node.connect(this.manager.getContext().destination);
    };
    return SpeakerController;
})();
var AudioController = (function () {
    function AudioController() {
        window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];
        this.manager = new AudioManager(new AudioContext());
        this.playerController = new PlayerController(this.manager);
        this.speakerController = new SpeakerController(this.manager);
    }
    AudioController.prototype.getPlayerController = function () {
        return this.playerController;
    };
    AudioController.prototype.getGLPropertiesObservable = function () {
        return this.manager.getGLPropertiesObservable();
    };
    AudioController.prototype.sampleAudio = function () {
        this.manager.sampleAudio();
    };
    return AudioController;
})();
var PlayerView = (function () {
    function PlayerView(playerController) {
        this.content = $("<div>", { class: "controls" });
        this.playerController = playerController;
    }
    PlayerView.prototype.render = function (el) {
        var _this = this;
        var mic = $("<a>", {
            href: "#",
            class: "mic"
        });
        var micIcon = $("<img>", {
            src: "./resources/ic_mic_none_white_48dp.png"
        });
        mic.append(micIcon);
        mic.click(function (e) {
            e.preventDefault();
            _this.playerController.onMicClick();
            _this.audioPlayer.pause();
        });
        var soundcloud = $('<div>', { class: 'soundcloud', text: 'Soundcloud URL:' });
        this.input = $("<input>", { class: 'soundcloud-input', type: 'text' });
        this.input.change(function () { return _this.playerController.onUrl(_this.input.val()); });
        soundcloud.append(this.input);
        this.audioPlayer = document.createElement("audio");
        this.audioPlayer.setAttribute('class', 'audio-player');
        this.audioPlayer.controls = true;
        this.playerController.getUrlObservable().subscribe(function (url) {
            _this.audioPlayer.setAttribute("src", url);
            _this.audioPlayer.play();
        });
        this.playerController.setPlayerSource(this.audioPlayer);
        this.content.append(mic);
        this.content.append(soundcloud);
        this.content.append(this.audioPlayer);
        $(el).append(this.content);
    };
    return PlayerView;
})();
var AppView = (function () {
    function AppView() {
        this.content = $("<div>", { text: "Hello, world!" });
        this.audioController = new AudioController();
        this.playerView = new PlayerView(this.audioController.getPlayerController());
        this.audioController.getGLPropertiesObservable().subscribe(function (glProperties) {
        });
    }
    AppView.prototype.render = function (el) {
        var _this = this;
        this.playerView.render(this.content[0]);
        $(el).append(this.content);
        requestAnimationFrame(function () { return _this.animate(); });
    };
    AppView.prototype.animate = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.animate(); });
        this.audioController.sampleAudio();
    };
    return AppView;
})();
function exec() {
    "use strict";
    var app = new AppView();
    app.render($("#content")[0]);
}
$(document).ready(function () {
    exec();
});
var AudioAnalyser = (function () {
    function AudioAnalyser(audioNode, fftSize) {
        this.analyser = audioNode.context.createAnalyser();
        this.fftSize = fftSize;
        audioNode.connect(this.analyser);
        this.frequencyBuffer = new Uint8Array(this.fftSize);
    }
    AudioAnalyser.prototype.update = function (time) {
        this.analyser.getByteFrequencyData(this.frequencyBuffer);
    };
    return AudioAnalyser;
})();
var TimeProperty = (function () {
    function TimeProperty(time) {
        this.name = "time";
        this.time = time;
    }
    TimeProperty.prototype.getName = function () {
        return this.name;
    };
    TimeProperty.prototype.addToGL = function (uniforms) {
        uniforms.time = {
            type: 'f',
            value: this.time
        };
        return uniforms;
    };
    return TimeProperty;
})();
