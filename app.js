var PlayerView = (function () {
    function PlayerView(playerController) {
        this.content = $("<div>", { class: "controls" });
        this.playerController = playerController;
    }
    PlayerView.prototype.render = function (el) {
        var _this = this;
        var soundcloud = $("<div>", { class: "soundcloud", text: "Soundcloud URL:" });
        this.input = $("<input>", { class: "soundcloud-input", type: "text" });
        this.input.change(function () { return _this.playerController.onUrl(_this.input.val()); });
        soundcloud.append(this.input);
        var mic = $("<a>", {
            href: "#",
            class: "mic-icon"
        });
        var micIcon = $("<img>", {
            src: "./resources/ic_mic_none_white_48dp.png",
            class: "icon"
        });
        mic.append(micIcon);
        mic.click(function (e) {
            e.preventDefault();
            _this.playerController.onMicClick();
            _this.audioPlayer.pause();
        });
        this.audioPlayer = document.createElement("audio");
        this.audioPlayer.setAttribute("class", "audio-player");
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
/// <reference path="./IUniform.ts"/>
var AudioAnalyser = (function () {
    function AudioAnalyser(audioNode, fftSize) {
        this._analyser = audioNode.context.createAnalyser();
        this.fftSize = fftSize;
        audioNode.connect(this._analyser);
        this.frequencyBuffer = new Uint8Array(this.fftSize);
        this.timeDomainBuffer = new Uint8Array(this.fftSize);
    }
    AudioAnalyser.prototype.getFrequencyData = function () {
        this._analyser.getByteFrequencyData(this.frequencyBuffer);
        return this.frequencyBuffer;
    };
    AudioAnalyser.prototype.getTimeDomainData = function () {
        this._analyser.getByteTimeDomainData(this.timeDomainBuffer);
        return this.timeDomainBuffer;
    };
    return AudioAnalyser;
})();
/// <reference path="../typed/rx.d.ts" />
/// <reference path="../typed/waa.d.ts" />
/// <reference path='./IUniform.ts'/>
/// <reference path="./IPropertiesProvider.ts" />
/// <reference path='./AudioAnalyser.ts'/>
var AudioManager = (function () {
    function AudioManager(audioContext) {
        this._audioContext = audioContext;
        this._audioEventSubject = new Rx.Subject();
        this.AudioEventObservable = this._audioEventSubject.asObservable();
    }
    AudioManager.prototype.updateSourceNode = function (sourceNode) {
        this._audioAnalyser = new AudioAnalyser(sourceNode, AudioManager.FFT_SIZE);
    };
    Object.defineProperty(AudioManager.prototype, "context", {
        get: function () {
            return this._audioContext;
        },
        enumerable: true,
        configurable: true
    });
    AudioManager.prototype.sampleAudio = function () {
        if (this._audioAnalyser === undefined) {
            return;
        }
        var frequencyBuffer = this._audioAnalyser.getFrequencyData();
        var timeDomainBuffer = this._audioAnalyser.getTimeDomainData();
        this._audioEventSubject.onNext({
            frequencyBuffer: frequencyBuffer,
            timeDomainBuffer: timeDomainBuffer
        });
    };
    AudioManager.FFT_SIZE = 1024;
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
        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true, video: false }, gotStream, function (err) { return console.log(err); });
        }
        else if (navigator.webkitGetUserMedia) {
            navigator.webkitGetUserMedia({ audio: true, video: false }, gotStream, function (err) { return console.log(err); });
        }
        else if (navigator.mozGetUserMedia) {
            navigator.mozGetUserMedia({ audio: true, video: false }, gotStream, function (err) { return console.log(err); });
        }
        else {
            return (alert("Error: getUserMedia not supported!"));
        }
        this.created = true;
    };
    Microphone.prototype.getNodeObservable = function () {
        return this.nodeSubject;
    };
    return Microphone;
})();
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
/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>
var PlayerController = (function () {
    function PlayerController() {
        var _this = this;
        window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
        this._manager = new AudioManager(new AudioContext());
        this.microphone = new Microphone();
        this.microphone.getNodeObservable().subscribe(function (node) { return _this.manager.updateSourceNode(node); });
        // this.soundCloudLoader = new SoundCloudLoader();
        this.onMicClick();
    }
    Object.defineProperty(PlayerController.prototype, "manager", {
        get: function () {
            return this._manager;
        },
        enumerable: true,
        configurable: true
    });
    PlayerController.prototype.onMicClick = function () {
        this.microphone.emitNode(this.manager.context);
    };
    PlayerController.prototype.onUrl = function (url) {
        this.soundCloudLoader.loadStream(url);
        this.manager.updateSourceNode(this.playerSource);
        this.playerSource.connect(this._manager.context.destination);
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
var ConstPropertiesProvider = (function () {
    function ConstPropertiesProvider() {
        this._propertiesSubject = new Rx.Subject();
    }
    ConstPropertiesProvider.prototype.glProperties = function () {
        return this._propertiesSubject.asObservable();
    };
    ConstPropertiesProvider.prototype.updateProperties = function (properties) {
        this._propertiesSubject.onNext(properties);
    };
    return ConstPropertiesProvider;
})();
/// <reference path='../Models/ConstPropertiesProvider.ts'/>
var GLView = (function () {
    function GLView(audioManager, glController) {
        this._glController = glController;
    }
    GLView.prototype.render = function (el) {
        var _this = this;
        this._camera = new THREE.Camera();
        this._scene = new THREE.Scene();
        this._renderer = new THREE.WebGLRenderer();
        this._camera.position.z = 1;
        var sceneContainer = new THREE.Object3D();
        this._scene.add(sceneContainer);
        this._glController.MeshObservable.scan(new THREE.Object3D(), function (obj, meshes) {
            obj = new THREE.Object3D();
            meshes.forEach(function (mesh) { return obj.add(mesh); });
            obj.position = new THREE.Vector3(0, 0, 0);
            return obj;
        }).subscribe(function (obj) {
            _this._scene.remove(sceneContainer);
            sceneContainer = obj;
            _this._scene.add(sceneContainer);
        });
        el.appendChild(this._renderer.domElement);
        this.onWindowResize();
        window.addEventListener('resize', function (__) { return _this.onWindowResize(); }, false);
        this._glController.onShaderName("loudness_test");
    };
    GLView.prototype.onWindowResize = function () {
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._glController.onNewResolution({ width: window.innerWidth, height: window.innerHeight });
    };
    GLView.prototype.animate = function () {
        this._glController.update();
        this._renderer.render(this._scene, this._camera);
    };
    return GLView;
})();
var ShaderPlane = (function () {
    function ShaderPlane(material) {
        console.log(material.uniforms.resolution);
        var geometry = new THREE.PlaneBufferGeometry(2, 2);
        this._mesh = new THREE.Mesh(geometry, material);
    }
    Object.defineProperty(ShaderPlane.prototype, "mesh", {
        get: function () {
            return this._mesh;
        },
        enumerable: true,
        configurable: true
    });
    return ShaderPlane;
})();
/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/three.d.ts"/>
var UniformsManager = (function () {
    function UniformsManager(propertiesProviders) {
        this._uniformsSubject = new Rx.Subject();
        this.UniformsObservable = this._uniformsSubject.asObservable();
        this._propertiesProviders = propertiesProviders;
    }
    UniformsManager.prototype.calculateUniforms = function () {
        var _this = this;
        Rx.Observable.from(this._propertiesProviders).flatMap(function (provider) { return provider.glProperties(); }).scan({}, function (acc, properties) {
            properties.forEach(function (property) { return acc[property.name] = property; });
            return acc;
        }).subscribe(function (properties) { return _this._uniformsSubject.onNext(properties); });
    };
    return UniformsManager;
})();
/// <reference path="../typed/rx.d.ts"/>
/// <reference path="./ShaderPlane.ts"/>
/// <reference path="./UniformsManager.ts"/>
var PropertiesShaderPlane = (function () {
    function PropertiesShaderPlane(glProperties) {
        this._shaderSubject = new Rx.Subject();
        this._meshSubject = new Rx.Subject();
        this.MeshObservable = this._meshSubject.asObservable();
        this._uniformsManager = new UniformsManager(glProperties);
        Rx.Observable.combineLatest(this._shaderSubject, this._uniformsManager.UniformsObservable, function (shaderText, uniforms) { return new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: shaderText.fragmentShader,
            vertexShader: shaderText.vertextShader
        }); }).map(function (shader) { return new ShaderPlane(shader).mesh; }).subscribe(this._meshSubject);
    }
    PropertiesShaderPlane.prototype.onShaderText = function (shader) {
        /* Calculate the uniforms after it's subscribed to*/
        this._uniformsManager.calculateUniforms();
        this._shaderSubject.onNext(shader);
    };
    return PropertiesShaderPlane;
})();
var ShaderText = (function () {
    function ShaderText(fragment, vertex) {
        this.fragmentShader = fragment;
        this.vertextShader = vertex;
    }
    return ShaderText;
})();
/// <reference path="../typed/rx.jquery.d.ts"/>
/// <reference path='./ShaderText.ts'/>
var ShaderLoader = (function () {
    function ShaderLoader() {
        var _this = this;
        this.getVertex("plane").subscribe(function (vert) { return _this._regularVert = vert; });
    }
    ShaderLoader.prototype.getShaderFromServer = function (name) {
        return Rx.Observable.combineLatest(this.getFragment(name), this.getVertex(name), function (frag, vert) { return new ShaderText(frag, vert); });
    };
    ShaderLoader.prototype.getVertex = function (name) {
        return $.getAsObservable('shaders/' + name + ".vert").map(function (shader) { return shader.data; }).onErrorResumeNext(Rx.Observable.just(this._regularVert));
    };
    ShaderLoader.prototype.getFragment = function (name) {
        return $.getAsObservable('shaders/' + name + '.frag').map(function (shader) { return shader.data; });
    };
    return ShaderLoader;
})();
var ResolutionProvider = (function () {
    function ResolutionProvider() {
        this._resolutionProperty = {
            name: "resolution",
            type: "v2",
            value: new THREE.Vector2(0, 0)
        };
    }
    ResolutionProvider.prototype.glProperties = function () {
        return Rx.Observable.just([this._resolutionProperty]);
    };
    ResolutionProvider.prototype.updateResolution = function (resolution) {
        this._resolutionProperty.value = resolution;
    };
    return ResolutionProvider;
})();
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
var AudioUniformProvider = (function () {
    function AudioUniformProvider(audioManager) {
        var _this = this;
        this._audioTextureBuffer = new Uint8Array(AudioManager.FFT_SIZE * 4);
        this._audioManager = audioManager;
        var dataTexture = new THREE.DataTexture(this._audioTextureBuffer, AudioManager.FFT_SIZE, 1, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearMipMapLinearFilter, 1);
        this._audioTexture = {
            name: "audioTexture",
            type: "t",
            value: dataTexture
        };
        this._audioManager.AudioEventObservable.subscribe(function (ae) { return _this.onAudioEvent(ae); });
    }
    AudioUniformProvider.prototype.glProperties = function () {
        return Rx.Observable.just([this._audioTexture]);
    };
    AudioUniformProvider.prototype.onAudioEvent = function (audioEvent) {
        for (var i = 0; i < audioEvent.frequencyBuffer.length; i++) {
            this._audioTextureBuffer[i * 4] = audioEvent.frequencyBuffer[i];
        }
        for (var i = 0; i < audioEvent.timeDomainBuffer.length; i++) {
            this._audioTextureBuffer[i * 4 + 1] = audioEvent.frequencyBuffer[i];
        }
        this._audioTexture.value.needsUpdate = true;
    };
    return AudioUniformProvider;
})();
var LoudnessAccumulator = (function () {
    function LoudnessAccumulator(audioManager) {
        var _this = this;
        this._accumulatedUniform = {
            name: "accumulatedLoudness",
            type: "f",
            value: 0.0
        };
        this._loudnessUniform = {
            name: "loudness",
            type: "f",
            value: 0.0
        };
        audioManager.AudioEventObservable.subscribe(function (ae) { return _this.onAudioEvent(ae); });
    }
    LoudnessAccumulator.prototype.onAudioEvent = function (audioEvent) {
        var sum = 0.0;
        for (var i = 0; i < audioEvent.frequencyBuffer.length; i++) {
            sum += audioEvent.frequencyBuffer[i];
        }
        var average = sum / audioEvent.frequencyBuffer.length;
        average = average / 128.0;
        average *= average;
        this._accumulatedUniform.value += average;
        this._loudnessUniform.value = average;
    };
    LoudnessAccumulator.prototype.glProperties = function () {
        return Rx.Observable.just([this._accumulatedUniform, this._loudnessUniform]);
    };
    return LoudnessAccumulator;
})();
/// <reference path='../typed/three.d.ts'/>
/// <reference path='../Models/IPropertiesProvider.ts'/>
/// <reference path='../Models/PropertiesShaderPlane.ts'/>
/// <reference path='../Models/ShaderLoader.ts'/>
/// <reference path='../Models/ResolutionProvider.ts'/>
/// <reference path='../Models/TimeProvider.ts'/>
/// <reference path='../Models/AudioUniformProvider.ts'/>
/// <reference path='../Models/LoudnessAccumulator.ts'/>
var GLController = (function () {
    function GLController(audioManager, videoManager) {
        var _this = this;
        this._meshSubject = new Rx.Subject();
        this.MeshObservable = this._meshSubject.asObservable();
        this._resolutionProvider = new ResolutionProvider();
        this._timeProvider = new TimeProvider();
        this._shaderLoader = new ShaderLoader();
        var audioUniformProvider = new AudioUniformProvider(audioManager);
        var loudnessAccumulator = new LoudnessAccumulator(audioManager);
        this._audioShaderPlane = new PropertiesShaderPlane([videoManager, this._resolutionProvider, this._timeProvider, audioUniformProvider, loudnessAccumulator]);
        this._audioShaderPlane.MeshObservable.subscribe(function (mesh) { return _this.onNewMeshes([mesh]); });
    }
    GLController.prototype.onNewResolution = function (resolution) {
        this._resolutionProvider.updateResolution(new THREE.Vector2(resolution.width, resolution.height));
    };
    GLController.prototype.onNewMeshes = function (meshes) {
        this._meshSubject.onNext(meshes);
    };
    GLController.prototype.onShaderName = function (name) {
        var _this = this;
        this._shaderLoader.getShaderFromServer(name).subscribe(function (shader) { return _this._audioShaderPlane.onShaderText(shader); });
    };
    GLController.prototype.update = function () {
        this._timeProvider.updateTime();
    };
    return GLController;
})();
var ShadersController = (function () {
    function ShadersController() {
        this._shaderNameSubject = new Rx.Subject();
        this.ShaderNameObservable = this._shaderNameSubject.asObservable();
    }
    ShadersController.prototype.onShaderName = function (shaderName) {
        this._shaderNameSubject.onNext(shaderName);
    };
    return ShadersController;
})();
/// <reference path='../Controllers/ShadersController'/>
var ShadersView = (function () {
    function ShadersView(shadersController) {
        this.content = $("<div>", { class: "queue" });
        this._shadersController = shadersController;
    }
    ShadersView.prototype.render = function (el) {
        var _this = this;
        var container = $("<div>", { class: "shaders" });
        var select = $("<select />");
        select.change(function (__) { return _this._shadersController.onShaderName(select.find('option:selected').val()); });
        ShadersView.shaders.forEach(function (shaderName) { return select.append("<option value=\"" + shaderName + "\">" + shaderName + "</option>"); });
        container.append(select);
        $(el).append(container);
    };
    ShadersView.shaders = [
        "simple",
        "fft_matrix_product",
        "circular_fft",
        "vertical_wav",
        "threejs_test",
        "video_test",
        "video_audio_distortion",
        "loudness_test",
        "mandelbrot",
        "mandelbrot_mover"
    ];
    return ShadersView;
})();
var VideoView = (function () {
    function VideoView(videoController) {
        this._video = document.createElement("video");
        this._video.setAttribute("class", "camera");
        this._video.setAttribute("autoplay", "true");
        this._videoController = videoController;
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
        this._videoController.setVideoSource(this._video);
    };
    return VideoView;
})();
var VideoManager = (function () {
    function VideoManager() {
        this._videoCanvas = document.createElement("canvas");
        this._videoCanvas.width = window.innerWidth;
        this._videoCanvas.height = window.innerHeight;
        this._videoContext = this._videoCanvas.getContext("2d");
        var texture = new THREE.Texture(this._videoCanvas);
        this._videoTexture = {
            name: "camera",
            type: "t",
            value: texture
        };
    }
    VideoManager.prototype.updateVideoElement = function (videoElement) {
        this._videoElement = videoElement;
    };
    VideoManager.prototype.glProperties = function () {
        return Rx.Observable.just([this._videoTexture]);
    };
    VideoManager.prototype.sampleVideo = function () {
        if (this._videoElement == undefined) {
            return;
        }
        this._videoContext.drawImage(this._videoElement, 0, 0, this._videoCanvas.width, this._videoCanvas.height);
        this._videoTexture.value.needsUpdate = true;
    };
    return VideoManager;
})();
/// <reference path='../Models/VideoManager.ts'/>
var VideoController = (function () {
    function VideoController() {
        this._videoManager = new VideoManager();
    }
    Object.defineProperty(VideoController.prototype, "Manager", {
        get: function () {
            return this._videoManager;
        },
        enumerable: true,
        configurable: true
    });
    VideoController.prototype.setVideoSource = function (videoElement) {
        this._videoManager.updateVideoElement(videoElement);
    };
    VideoController.prototype.sampleVideo = function () {
        this._videoManager.sampleVideo();
    };
    return VideoController;
})();
/// <reference path="./PlayerView.ts"/>
/// <reference path="../Controllers/PlayerController.ts"/>
/// <reference path="./GLView.ts"/>
/// <reference path="../Controllers/GLController.ts"/>
/// <reference path="./ShadersView.ts"/>
/// <reference path="./VideoView.ts"/>
/// <reference path="../Controllers/VideoController.ts"/>
/// <reference path='./IControllerView.ts' />
var AppView = (function () {
    function AppView() {
        var _this = this;
        this.content = $("<div>", { text: "Hello, world!" });
        this._playerController = new PlayerController();
        this._videoController = new VideoController();
        this._shadersController = new ShadersController();
        this._glController = new GLController(this._playerController.manager, this._videoController.Manager);
        this.playerView = new PlayerView(this._playerController);
        this._glView = new GLView(this._playerController.manager, this._glController);
        this._shadersView = new ShadersView(this._shadersController);
        this._videoView = new VideoView(this._videoController);
        this._shadersController.ShaderNameObservable.subscribe(function (name) { return _this._glController.onShaderName(name); });
    }
    AppView.prototype.render = function (el) {
        var _this = this;
        // this.playerView.render(this.content[0]);
        this._glView.render(this.content[0]);
        this._shadersView.render(this.content[0]);
        this._videoView.render(this.content[0]);
        $(el).append(this.content);
        requestAnimationFrame(function () { return _this.animate(); });
    };
    AppView.prototype.animate = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.animate(); });
        this._playerController.sampleAudio();
        this._videoController.sampleVideo();
        this._glView.animate();
    };
    return AppView;
})();
/// <reference path="./typed/jquery.d.ts"/>
/// <reference path="./typed/rx.d.ts"/>
/// <reference path="./typed/waa.d.ts"/>
/// <reference path="./typed/soundcloud.d.ts"/>
/// <reference path="Views/AppView.ts"/>
function exec() {
    "use strict";
    var app = new AppView();
    app.render($("#content")[0]);
}
$(document).ready(function () {
    exec();
});
//# sourceMappingURL=app.js.map