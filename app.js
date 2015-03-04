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
/// <reference path="../typed/rx.d.ts"/>
/// <reference path="./IGLProperty.ts"/>
/// <reference path="./IGLProperty.ts"/>
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
/// <reference path="../typed/rx.d.ts" />
/// <reference path="../typed/waa.d.ts" />
/// <reference path="./IGLProperty.ts" />
/// <reference path="./IPropertiesProvider.ts" />
/// <reference path='./TimeProperty.ts'/>
// Input: an audio context and a render time observable.
// Output: an IGLProperty Array observable containing sampled audio data.
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
        this.soundCloudLoader = new SoundCloudLoader();
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
    function GLView(audioManager) {
        this._glController = new GLController(audioManager);
    }
    GLView.prototype.render = function (el) {
        var _this = this;
        this._camera = new THREE.Camera();
        this._scene = new THREE.Scene();
        this._renderer = new THREE.WebGLRenderer();
        this._camera.position.z = 1;
        this._renderer.setPixelRatio(window.devicePixelRatio);
        var sceneContainer = new THREE.Object3D();
        this._scene.add(sceneContainer);
        this._glController.MeshObservable.scan(new THREE.Object3D(), function (obj, meshes) {
            obj = new THREE.Object3D();
            meshes.forEach(function (mesh) { return obj.add(mesh); });
            return obj;
        }).subscribe(function (obj) {
            _this._scene.remove(sceneContainer);
            sceneContainer = obj;
            _this._scene.add(sceneContainer);
        });
        el.appendChild(this._renderer.domElement);
        this.onWindowResize();
        window.addEventListener('resize', function (__) { return _this.onWindowResize(); }, false);
        this._glController.onShaderName("vertical_wav");
    };
    GLView.prototype.onWindowResize = function () {
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._glController.onNewResolution({ width: window.innerWidth, height: window.innerHeight });
    };
    GLView.prototype.animate = function () {
        this._renderer.render(this._scene, this._camera);
    };
    return GLView;
})();
/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/three.d.ts"/>
var UniformsManager = (function () {
    function UniformsManager() {
        this._uniforms = {};
    }
    Object.defineProperty(UniformsManager.prototype, "uniforms", {
        get: function () {
            return this._uniforms;
        },
        enumerable: true,
        configurable: true
    });
    UniformsManager.fromPropertyProviders = function (propertiesProviders) {
        var uniformsManager = new UniformsManager();
        Rx.Observable.merge(Rx.Observable.from(propertiesProviders).flatMap(function (provider) { return provider.glProperties(); }).flatMap(function (properties) { return Rx.Observable.from(properties); })).subscribe(function (property) { return uniformsManager.createOrUpdateUniform(property); });
        return uniformsManager;
    };
    UniformsManager.prototype.createOrUpdateUniform = function (property) {
        this._uniforms[property.name()] = property.uniform();
    };
    return UniformsManager;
})();
var ShaderPlane = (function () {
    function ShaderPlane(material) {
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
/// <reference path="./ShaderPlane.ts"/>
/// <reference path="./UniformsManager.ts"/>
var AudioShaderPlane = (function () {
    function AudioShaderPlane(audioManager, additionalProperties) {
        this._shaderSubject = new Rx.Subject();
        this._meshSubject = new Rx.Subject();
        this.MeshObservable = this._meshSubject.asObservable();
        var uniformsManager = UniformsManager.fromPropertyProviders(additionalProperties.concat([audioManager]));
        this._shaderSubject.map(function (shaderText) {
            return new THREE.ShaderMaterial({
                uniforms: uniformsManager.uniforms,
                fragmentShader: shaderText.fragmentShader,
                vertexShader: shaderText.vertextShader
            });
        }).map(function (shader) { return new ShaderPlane(shader).mesh; }).subscribe(this._meshSubject);
    }
    AudioShaderPlane.prototype.onShaderText = function (shader) {
        this._shaderSubject.onNext(shader);
    };
    return AudioShaderPlane;
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
    }
    ShaderLoader.prototype.getShaderFromServer = function (name) {
        return Rx.Observable.combineLatest(this.getFragment(name), this.getVertex(name), function (frag, vert) { return new ShaderText(frag, vert); });
    };
    ShaderLoader.prototype.getVertex = function (name) {
        return $.getAsObservable('/shaders/' + name + ".vert").map(function (shader) { return shader.data; });
    };
    ShaderLoader.prototype.getFragment = function (name) {
        return $.getAsObservable('/shaders/' + name + '.frag').map(function (shader) { return shader.data; });
    };
    return ShaderLoader;
})();
var ResolutionProvider = (function () {
    function ResolutionProvider() {
        this._resolutionSubject = new Rx.Subject();
    }
    ResolutionProvider.prototype.glProperties = function () {
        return this._resolutionSubject.asObservable().map(function (resolution) { return [resolution]; });
    };
    ResolutionProvider.prototype.updateResolution = function (resolution) {
        this._resolutionSubject.onNext({
            name: function () {
                return "resolution";
            },
            type: function () {
                return "v2";
            },
            value: function () {
                return resolution;
            },
            uniform: function () {
                return { type: "v2", value: resolution };
            }
        });
    };
    return ResolutionProvider;
})();
/// <reference path='../typed/three.d.ts'/>
/// <reference path='../Models/IPropertiesProvider.ts'/>
/// <reference path='../Models/UniformsManager.ts'/>
/// <reference path='../Models/AudioShaderPlane.ts'/>
/// <reference path='../Models/ShaderLoader.ts'/>
/// <reference path='../Models/ResolutionProvider.ts'/>
var GLController = (function () {
    function GLController(audioManager) {
        var _this = this;
        this._uniformsManager = UniformsManager.fromPropertyProviders([audioManager]);
        this._meshSubject = new Rx.Subject();
        this.MeshObservable = this._meshSubject.asObservable();
        this._resolutionProvider = new ResolutionProvider();
        this._shaderLoader = new ShaderLoader();
        this._audioShaderPlane = new AudioShaderPlane(audioManager, [this._resolutionProvider]);
        this._audioShaderPlane.MeshObservable.subscribe(function (mesh) { return _this.onNewMeshes([mesh]); });
    }
    GLController.fromAudioManager = function (audioManager) {
        var controller = new GLController(audioManager);
    };
    GLController.prototype.onNewResolution = function (resolution) {
        this._resolutionProvider.updateResolution(new THREE.Vector2(resolution.width, resolution.height));
    };
    GLController.prototype.onNewMeshes = function (meshes) {
        this._meshSubject.onNext(meshes);
    };
    GLController.prototype.onShaderName = function (name) {
        var _this = this;
        this._shaderLoader.getShaderFromServer("time_test").subscribe(function (shader) { return _this._audioShaderPlane.onShaderText(shader); });
    };
    return GLController;
})();
/// <reference path="./PlayerView.ts"/>
/// <reference path="../Controllers/PlayerController.ts"/>
/// <reference path="./GLView.ts"/>
/// <reference path="../Controllers/GLController.ts"/>
/// <reference path='./IControllerView.ts' />
var AppView = (function () {
    function AppView() {
        this.content = $("<div>", { text: "Hello, world!" });
        this._playerController = new PlayerController();
        this.playerView = new PlayerView(this._playerController);
        this._glView = new GLView(this._playerController.manager);
    }
    AppView.prototype.render = function (el) {
        var _this = this;
        this.playerView.render(this.content[0]);
        this._glView.render(this.content[0]);
        $(el).append(this.content);
        requestAnimationFrame(function () { return _this.animate(); });
    };
    AppView.prototype.animate = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.animate(); });
        this._playerController.sampleAudio();
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