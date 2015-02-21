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
var AudioManager = (function () {
    function AudioManager(audioContext) {
        this._audioContext = audioContext;
        this.renderTimeObservable = new Rx.Subject();
    }
    AudioManager.prototype.updateSourceNode = function (sourceNode) {
        sourceNode.connect(this.context.destination);
    };
    Object.defineProperty(AudioManager.prototype, "context", {
        get: function () {
            return this._audioContext;
        },
        enumerable: true,
        configurable: true
    });
    AudioManager.prototype.glProperties = function () {
        return this.renderTimeObservable.map(function (time) { return new TimeProperty(time); }).map(function (timeProperty) {
            var props = new Array();
            props.push(timeProperty);
            return props;
        });
    };
    AudioManager.prototype.sampleAudio = function () {
        this.renderTimeObservable.onNext(this._audioContext.currentTime);
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
    function PlayerController() {
        var _this = this;
        window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
        this.manager = new AudioManager(new AudioContext());
        this.microphone = new Microphone();
        this.microphone.getNodeObservable().subscribe(function (node) { return _this.manager.updateSourceNode(node); });
        this.soundCloudLoader = new SoundCloudLoader();
    }
    PlayerController.prototype.onMicClick = function () {
        this.microphone.emitNode(this.manager.context);
    };
    PlayerController.prototype.onUrl = function (url) {
        this.soundCloudLoader.loadStream(url);
        this.manager.updateSourceNode(this.playerSource);
    };
    PlayerController.prototype.setPlayerSource = function (source) {
        this.playerSource = this.manager.context.createMediaElementSource(source);
    };
    PlayerController.prototype.sampleAudio = function () {
        this.manager.sampleAudio();
    };
    PlayerController.prototype.getUrlObservable = function () {
        return this.soundCloudLoader.getUrlObservable();
    };
    return PlayerController;
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
        this._playerController = new PlayerController();
        this.playerView = new PlayerView(this._playerController);
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
        this._playerController.sampleAudio();
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
var ShaderManager = (function () {
    function ShaderManager(propertiesProviders, shaderProvider) {
        var _this = this;
        this._shaderProvider = shaderProvider;
        this._uniforms = {};
        Rx.Observable.merge(Rx.Observable.from(propertiesProviders).flatMap(function (provider) {
            return provider.glProperties();
        }).flatMap(function (properties) { return Rx.Observable.from(properties); })).subscribe(function (property) {
            property.addToGL(_this._uniforms);
        });
    }
    ShaderManager.prototype.updatingShaderObservable = function () {
        var _this = this;
        return this._shaderProvider.shaderObservable().doOnNext(function (shaderMaterial) { return shaderMaterial.uniforms = _this._uniforms; });
    };
    return ShaderManager;
})();
QUnit.module("audioManger");
window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
var audioManager = new AudioManager(new AudioContext());
test("Update source node", function () {
    var source = audioManager.context.createOscillator();
    audioManager.updateSourceNode(source);
    equal(1, audioManager.context.destination.numberOfInputs, "destination should have input");
});
test("Time property", function () {
    var scheduler = new Rx.TestScheduler();
    var mockObserver = scheduler.createObserver();
    audioManager.glProperties().subscribe(mockObserver);
    var time = audioManager.context.currentTime;
    audioManager.sampleAudio();
    notEqual(0, mockObserver.messages.length);
    equal(mockObserver.messages[0].value.value[0].getName(), "time", "A property named time");
    equal(mockObserver.messages[0].value.value[0].addToGL(new Object()).time.value, time, "Corrent time value");
});
QUnit.module("shaderCreator");
window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
var audioManager = new AudioManager(new AudioContext());
var shaderMaterial = new THREE.ShaderMaterial();
var shaderProvider = {
    shaderObservable: function () {
        return Rx.Observable.just(shaderMaterial);
    }
};
var shaderCreator = new ShaderManager([audioManager], shaderProvider);
test("Time property", function () {
    var scheduler = new Rx.TestScheduler();
    var observer = scheduler.createObserver();
    shaderCreator.updatingShaderObservable().subscribe(observer);
    audioManager.sampleAudio();
    var time = audioManager.context.currentTime;
    equal(observer.messages[0].value.value.uniforms.time.type, "f");
    equal(observer.messages[0].value.value.uniforms.time.value, time);
});
test("Shader creation", function () {
    var scheduler = new Rx.TestScheduler();
    var observer = scheduler.createObserver();
    shaderCreator.updatingShaderObservable().subscribe(observer);
    audioManager.sampleAudio();
    var time = audioManager.context.currentTime;
    equal(observer.messages[0].value.value, shaderMaterial, "Outputs shader material");
});
var GLView = (function () {
    function GLView() {
    }
    return GLView;
})();
