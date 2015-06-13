var PlayerView = (function () {
    function PlayerView(playerController) {
        this.content = $("<div>", { class: "controls audio-controls" });
        this.playerController = playerController;
    }
    PlayerView.prototype.render = function (el) {
        var _this = this;
        this.audioPlayer = document.createElement("audio");
        this.audioPlayer.setAttribute("class", "audio-player");
        this.audioPlayer.controls = true;
        this.audioPlayer.autoplay = true;
        this.playerController.getUrlObservable().subscribe(function (url) {
            _this.audioPlayer.setAttribute("src", url);
            _this.audioPlayer.play();
        });
        window.addEventListener('load', function (e) {
            _this.playerController.setPlayerSource(_this.audioPlayer);
        }, false);
        this.content.append(this.audioPlayer);
        $(el).append(this.content);
    };
    return PlayerView;
})();
var PlaylistView = (function () {
    function PlaylistView(playerController) {
        this._content = $("<div>", { class: "controls playlist" });
        this._playerController = playerController;
        this._currentTrack = -1;
    }
    PlaylistView.prototype.render = function (el) {
        var _this = this;
        this._list = $("<ol>");
        this._playerController.tracks().forEach(function (track) {
        });
        this._playerController.tracks().forEach(function (track) {
            var trackLi = $("<li>", { html: _this.createText(track) });
            trackLi.click(function (e) {
                _this._playerController.playTrack(trackLi.index());
            });
            _this._list.append(trackLi);
        });
        this._playerController.getTrackObservable()
            .doOnNext(function (__) {
            if (_this._currentTrack != -1) {
                $(_this._list.children().get(_this._currentTrack)).css("font-weight", "Normal");
            }
        })
            .subscribe(function (track) {
            $(_this._list.children().get(track)).css("font-weight", "Bold");
            _this._currentTrack = track;
        });
        this._content.append(this._list);
        $(el).append(this._content);
    };
    PlaylistView.prototype.createText = function (track) {
        return track.title + " - " + track.artist;
    };
    return PlaylistView;
})();
/// <reference path="./IUniform.ts"/>
var AudioAnalyser = (function () {
    function AudioAnalyser(context, fftSize) {
        this._analyser = context.createAnalyser();
        this.fftSize = fftSize;
        this.segmentSize = fftSize / 8.0;
        this.frequencyBuffer = new Uint8Array(this.fftSize);
        this.timeDomainBuffer = new Uint8Array(this.fftSize);
    }
    AudioAnalyser.prototype.connectSource = function (node) {
        node.connect(this._analyser);
        this._connected = true;
    };
    AudioAnalyser.prototype.connectDestination = function (dest) {
        this._analyser.connect(dest);
    };
    AudioAnalyser.prototype.getFrequencyData = function () {
        if (this._connected) {
            this._analyser.getByteFrequencyData(this.frequencyBuffer);
        }
        return this.frequencyBuffer;
    };
    AudioAnalyser.prototype.getEQSegments = function () {
        if (this.frequencyBuffer != undefined) {
            var vec = [0.0, 0.0, 0.0, 0.0];
            for (var i = 0; i < this.segmentSize * 4; i++) {
                var val = this.frequencyBuffer[i];
                vec[Math.floor(i / this.segmentSize)] += val * val / (255 - ((255 - val) * i / (this.segmentSize * 4.0)));
            }
            return new THREE.Vector4(vec[0] / (256.0 * this.segmentSize), vec[1] / (256.0 * this.segmentSize), vec[2] / (256.0 * this.segmentSize), vec[3] / (256.0 * this.segmentSize));
        }
        return new THREE.Vector4(0.0, 0.0, 0.0, 0.0);
    };
    AudioAnalyser.prototype.getTimeDomainData = function () {
        if (this._connected) {
            this._analyser.getByteTimeDomainData(this.timeDomainBuffer);
        }
        return this.timeDomainBuffer;
    };
    return AudioAnalyser;
})();
/// <reference path="../typed/rx.d.ts" />
/// <reference path="../typed/waa.d.ts" />
/// <reference path='./IUniform.ts'/>
/// <reference path="./IPropertiesProvider.ts" />
/// <reference path='./AudioAnalyser.ts'/>
/// <reference path="../typed/three.d.ts"/>
/// <reference path="./Source"/>
var AudioSource = (function () {
    function AudioSource(audioContext) {
        this._audioContext = audioContext;
        this._audioAnalyser = new AudioAnalyser(this._audioContext, AudioSource.FFT_SIZE);
        this._audioEventSubject = new Rx.Subject();
        this.SourceObservable = this._audioEventSubject.asObservable();
    }
    AudioSource.prototype.updateSourceNode = function (sourceNode) {
        this._audioAnalyser.connectSource(sourceNode);
    };
    AudioSource.prototype.usePlayerSource = function (source) {
        var mediaElement = this._audioContext.createMediaElementSource(source);
        this.updateSourceNode(mediaElement);
        this._audioAnalyser.connectDestination(this._audioContext.destination);
        return mediaElement;
    };
    AudioSource.prototype.animate = function () {
        if (this._audioAnalyser === undefined) {
            return;
        }
        var frequencyBuffer = this._audioAnalyser.getFrequencyData();
        var timeDomainBuffer = this._audioAnalyser.getTimeDomainData();
        var eqSegments = this._audioAnalyser.getEQSegments();
        this._audioEventSubject.onNext({
            frequencyBuffer: frequencyBuffer,
            timeDomainBuffer: timeDomainBuffer
        });
    };
    AudioSource.FFT_SIZE = 1024;
    return AudioSource;
})();
var Microphone = (function () {
    function Microphone(context) {
        this.created = false;
        this.nodeSubject = new Rx.Subject();
    }
    Microphone.prototype.onContext = function (audioContext) {
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
            navigator.getUserMedia({ audio: true, video: false }, gotStream, function (err) {
                return console.log(err);
            });
        }
        else if (navigator.webkitGetUserMedia) {
            navigator.webkitGetUserMedia({ audio: true, video: false }, gotStream, function (err) {
                return console.log(err);
            });
        }
        else if (navigator.mozGetUserMedia) {
            navigator.mozGetUserMedia({ audio: true, video: false }, gotStream, function (err) {
                return console.log(err);
            });
        }
        else {
            this.created = false;
            return (alert("Error: getUserMedia not supported!"));
        }
        this.created = true;
    };
    Microphone.prototype.nodeObservable = function () {
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
/// <reference path="../Models/AudioSource.ts"/>
/// <reference path="../Models/Microphone.ts"/>
/// <reference path="../Models/SoundCloudLoader.ts"/>
/// <reference path="../typed/rx.binding-lite.d.ts"/>
var PlayerController = (function () {
    function PlayerController(tracks, manager) {
        this._tracks = tracks;
        this._currentTrack = 0;
        this._manager = manager;
        this._urlSubject = new Rx.BehaviorSubject(tracks[this._currentTrack].url);
        this._currentTrackSubject = new Rx.BehaviorSubject(0);
    }
    Object.defineProperty(PlayerController.prototype, "manager", {
        get: function () { return this._manager; },
        enumerable: true,
        configurable: true
    });
    PlayerController.prototype.setPlayerSource = function (source) {
        var _this = this;
        var playerSource = this.manager.usePlayerSource(source);
        source.onended = function (ev) { return _this.nextSong(); };
    };
    PlayerController.prototype.getUrlObservable = function () {
        return this._urlSubject.asObservable();
    };
    PlayerController.prototype.getTrackObservable = function () {
        return this._currentTrackSubject.asObservable();
    };
    PlayerController.prototype.tracks = function () {
        return this._tracks;
    };
    PlayerController.prototype.playTrack = function (track) {
        if (track < this._tracks.length) {
            this._currentTrackSubject.onNext(track);
            this._urlSubject.onNext(this._tracks[track].url);
            this._currentTrack = track;
        }
    };
    PlayerController.prototype.nextSong = function () {
        this._currentTrack++;
        this.playTrack(this._currentTrack);
    };
    return PlayerController;
})();
var GLView = (function () {
    function GLView(glController) {
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
        this._glController.MeshObservable
            .scan(function (obj, meshes) {
            obj = new THREE.Object3D();
            meshes.forEach(function (mesh) { return obj.add(mesh); });
            obj.position = new THREE.Vector3(0, 0, 0);
            return obj;
        }, new THREE.Object3D())
            .subscribe(function (obj) {
            _this._scene.remove(sceneContainer);
            sceneContainer = obj;
            _this._scene.add(sceneContainer);
        });
        el.appendChild(this._renderer.domElement);
        this.onWindowResize();
        window.addEventListener('resize', function (__) { return _this.onWindowResize(); }, false);
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
var ShaderPlane = (function () {
    function ShaderPlane(shader, uniforms) {
        var fragText = shader.fragmentShader;
        var uniformObject = {};
        uniforms.forEach(function (uniform) { return uniformObject[uniform.name] = uniform; });
        Object.keys(uniformObject).forEach(function (key) {
            var uniform = uniformObject[key];
            var uniformType;
            switch (uniform.type) {
                case "f":
                    uniformType = "float";
                    break;
                case "v2":
                    uniformType = "vec2";
                    break;
                case "v3":
                    uniformType = "vec3";
                    break;
                case "v4":
                    uniformType = "vec4";
                    break;
                case "t":
                    uniformType = "sampler2D";
                    break;
                default:
                    console.log("Unknown shader");
            }
            fragText = "uniform " + uniformType + " " + uniform.name + ";\n" + fragText;
        });
        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniformObject,
            fragmentShader: fragText,
            vertexShader: shader.vertexShader
        });
        var geometry = new THREE.PlaneBufferGeometry(2, 2);
        this._mesh = new THREE.Mesh(geometry, shaderMaterial);
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
        Rx.Observable.from(this._propertiesProviders)
            .map(function (provider) { return provider.uniforms(); })
            .scan(function (acc, properties) {
            properties.forEach(function (property) { return acc[property.name] = property; }, {});
            return acc;
        })
            .subscribe(function (properties) { return _this._uniformsSubject.onNext(properties); });
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
        Rx.Observable.combineLatest(this._shaderSubject, this._uniformsManager.UniformsObservable, function (shaderText, uniforms) { return new ShaderPlane(shaderText, uniforms).mesh; })
            .subscribe(this._meshSubject);
    }
    PropertiesShaderPlane.prototype.onShaderText = function (shader) {
        /* Calculate the uniforms after it's subscribed to*/
        this._shaderSubject.onNext(shader);
        this._uniformsManager.calculateUniforms();
    };
    return PropertiesShaderPlane;
})();
var ShaderText = (function () {
    function ShaderText(fragment, vertex) {
        this.fragmentShader = fragment;
        this.vertexShader = vertex;
    }
    return ShaderText;
})();
/// <reference path="../typed/rx.jquery.d.ts"/>
/// <reference path='./ShaderText.ts'/>
var ShaderLoader = (function () {
    function ShaderLoader(initialMethodsUrl, utilsUrl, shadersUrl) {
        var _this = this;
        this._shadersUrl = shadersUrl;
        this._initialMethodsUrl = shadersUrl + initialMethodsUrl;
        this._utilsUrl = shadersUrl + utilsUrl;
        this.getVertex("plane").filter(function (vert) { return vert != null; }).subscribe(function (vert) {
            _this._regularVert = vert;
        });
    }
    ShaderLoader.prototype.getShaderFromServer = function (url) {
        return Rx.Observable.zip(this.getFragment(url), this.getVertex(url), function (frag, vert) { return new ShaderText(frag, vert); });
    };
    ShaderLoader.prototype.getVertex = function (url) {
        return $.getAsObservable(this._shadersUrl + url + ".vert")
            .map(function (shader) { return shader.data; })
            .onErrorResumeNext(Rx.Observable.just(this._regularVert));
    };
    ShaderLoader.prototype.getFragment = function (url) {
        return $.getAsObservable(this._shadersUrl + url + '.frag')
            .map(function (shader) { return shader.data; })
            .combineLatest(this.utilFrag(), this.initialMethodsFrag(), function (frag, im, util) { return util.concat(im).concat(frag); });
    };
    ShaderLoader.prototype.utilFrag = function () {
        var _this = this;
        if (this._utilFrag === undefined) {
            return $.getAsObservable(this._utilsUrl)
                .map(function (shader) { return shader.data; })
                .doOnNext(function (util) { return _this._utilFrag = util; });
        }
        return Rx.Observable.just(this._utilFrag);
    };
    ShaderLoader.prototype.initialMethodsFrag = function () {
        var _this = this;
        if (this._initialMethodsFrag === undefined) {
            return $.getAsObservable(this._initialMethodsUrl)
                .map(function (shader) { return shader.data; })
                .doOnNext(function (util) { return _this._initialMethodsFrag = util; });
        }
        return Rx.Observable.just(this._initialMethodsFrag);
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
    ResolutionProvider.prototype.uniforms = function () {
        return [this._resolutionProperty];
    };
    ResolutionProvider.prototype.updateResolution = function (resolution) {
        this._resolutionProperty.value = resolution;
    };
    return ResolutionProvider;
})();
var TimeSource = (function () {
    function TimeSource() {
        this._startTime = Date.now();
        this._timeSubject = new Rx.Subject();
        this.SourceObservable = this._timeSubject.asObservable();
    }
    TimeSource.prototype.animate = function () {
        this._timeSubject.onNext((this._startTime - Date.now()) / 1000.0);
    };
    return TimeSource;
})();
// class AudioUniformProvider implements IPropertiesProvider<THREE.DataTexture>{
//   private _audioManager: AudioManager;
//
//   private _audioTexture: IUniform<THREE.DataTexture>;
//   private _audioTextureBuffer = new Uint8Array(AudioManager.FFT_SIZE * 4);
//
//   private _eqSegments: IUniform<THREE.Vector4>;
//
//   constructor(audioManager: AudioManager) {
//     this._audioManager = audioManager;
//
//     var dataTexture = new THREE.DataTexture(
//       this._audioTextureBuffer,
//       AudioManager.FFT_SIZE,
//       1,
//       THREE.RGBAFormat,
//       THREE.UnsignedByteType,
//       THREE.UVMapping,
//       THREE.ClampToEdgeWrapping,
//       THREE.ClampToEdgeWrapping,
//       THREE.LinearFilter,
//       THREE.LinearMipMapLinearFilter,
//       1);
//
//     this._audioTexture = {
//       name: "audioTexture",
//       type: "t",
//       value: dataTexture
//     }
//
//     this._eqSegments = {
//       name: "eqSegments",
//       type: "v4",
//       value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0)
//     }
//
//     this._audioManager.AudioEventObservable.subscribe((ae) => this.onAudioEvent(ae));
//   }
//
//   glProperties(): Rx.Observable<Array<IUniform<any>>> {
//     return Rx.Observable.just([this._audioTexture, this._eqSegments]);
//   }
//
//   onAudioEvent(audioEvent: IAudioEvent) {
//     for (var i = 0; i < audioEvent.frequencyBuffer.length; i++) {
//       this._audioTextureBuffer[i * 4] = audioEvent.frequencyBuffer[i];
//     }
//
//     for (var i = 0; i < audioEvent.timeDomainBuffer.length; i++) {
//       this._audioTextureBuffer[i * 4 + 1] = audioEvent.frequencyBuffer[i];
//     }
//
//     this._audioTexture.value.needsUpdate = true;
//
//     this._eqSegments.value = audioEvent.eqSegments;
//   }
// }
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
        audioManager.SourceObservable.subscribe(function (ae) { return _this.onAudioEvent(ae); });
    }
    LoudnessAccumulator.prototype.setVolumeUniform = function (volumeUniform) {
        this._volume = volumeUniform;
    };
    LoudnessAccumulator.prototype.onAudioEvent = function (audioEvent) {
        var sum = 0.0;
        for (var i = 0; i < audioEvent.frequencyBuffer.length; i++) {
            sum += audioEvent.frequencyBuffer[i];
        }
        var volume = this._volume === undefined ? 1.0 : this._volume.value;
        var average = sum / audioEvent.frequencyBuffer.length;
        average = average / 128.0;
        this._accumulatedUniform.value += average * volume;
        this._loudnessUniform.value = average;
    };
    LoudnessAccumulator.prototype.uniforms = function () {
        return [this._accumulatedUniform, this._loudnessUniform];
    };
    return LoudnessAccumulator;
})();
var BaseVisualization = (function () {
    function BaseVisualization() {
        this._sources = [];
        this._disposable = new Rx.CompositeDisposable();
    }
    BaseVisualization.prototype.addSources = function (sources) {
        this._sources = this._sources.concat(sources);
    };
    BaseVisualization.prototype.addDisposable = function (disposable) {
        this._disposable.add(disposable);
    };
    BaseVisualization.prototype.animate = function () {
        this._sources.forEach(function (source) { return source.animate(); });
    };
    BaseVisualization.prototype.meshObservable = function () {
        console.log("Yo, you forgot to implement meshObservable().");
        return null;
    };
    BaseVisualization.prototype.unsubscribe = function () {
        this._disposable.dispose();
    };
    return BaseVisualization;
})();
var AudioUniformFunctions;
(function (AudioUniformFunctions) {
    function updateAudioBuffer(e, buf) {
        for (var i = 0; i < e.frequencyBuffer.length; i++) {
            buf[i * 4] = e.frequencyBuffer[i];
        }
        for (var i = 0; i < e.timeDomainBuffer.length; i++) {
            buf[i * 4 + 1] = e.frequencyBuffer[i];
        }
    }
    AudioUniformFunctions.updateAudioBuffer = updateAudioBuffer;
    function calculateEqs(e, segmentSize) {
        if (e.frequencyBuffer != undefined) {
            var vec = [0.0, 0.0, 0.0, 0.0];
            for (var i = 0; i < segmentSize * 4; i++) {
                var val = e.frequencyBuffer[i];
                vec[Math.floor(i / segmentSize)] += val * val / (255 - ((255 - val) * i / (segmentSize * 4.0)));
            }
            return new THREE.Vector4(vec[0] / (256.0 * segmentSize), vec[1] / (256.0 * segmentSize), vec[2] / (256.0 * segmentSize), vec[3] / (256.0 * segmentSize));
        }
        return new THREE.Vector4(0.0, 0.0, 0.0, 0.0);
    }
    AudioUniformFunctions.calculateEqs = calculateEqs;
    function calculateLoudness(e) {
        var sum = 0.0;
        for (var i = 0; i < e.frequencyBuffer.length; i++) {
            sum += e.frequencyBuffer[i];
        }
        var volume = this._volume === undefined ? 1.0 : this._volume.value;
        var average = sum / e.frequencyBuffer.length;
        average = average / 128.0;
        return average;
    }
    AudioUniformFunctions.calculateLoudness = calculateLoudness;
})(AudioUniformFunctions || (AudioUniformFunctions = {}));
/// <reference path="./AudioUniformFunctions" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ShaderVisualization = (function (_super) {
    __extends(ShaderVisualization, _super);
    function ShaderVisualization(resolutionProvider, timeSource, shaderLoader, shaderUrl) {
        _super.call(this);
        this.addSources([timeSource]);
        this._shaderUrl = shaderUrl;
        this._timeSource = timeSource;
        this._shaderLoader = shaderLoader;
        this._timeUniform = {
            name: "time",
            type: "f",
            value: 0.0
        };
        this._uniforms = [this._timeUniform].concat(resolutionProvider.uniforms());
    }
    ShaderVisualization.prototype.setupVisualizerChain = function () {
        var _this = this;
        this.addDisposable(this._timeSource.SourceObservable.subscribe(function (time) { return _this._timeUniform.value = time; }));
    };
    ShaderVisualization.prototype.addUniforms = function (uniforms) {
        this._uniforms = this._uniforms.concat(uniforms);
    };
    ShaderVisualization.prototype.meshObservable = function () {
        var _this = this;
        return Rx.Observable.create(function (observer) {
            _this.setupVisualizerChain();
            _this._shaderLoader.getShaderFromServer(_this._shaderUrl)
                .map(function (shader) { return new ShaderPlane(shader, _this._uniforms); })
                .map(function (shaderplane) { return [shaderplane.mesh]; })
                .subscribe(observer);
        });
    };
    return ShaderVisualization;
})(BaseVisualization);
/// <reference path="./ShaderVisualization"/>
var AudioTextureShaderVisualization = (function (_super) {
    __extends(AudioTextureShaderVisualization, _super);
    function AudioTextureShaderVisualization(audioSource, resolutionProvider, timeSource, shaderLoader, shaderUrl) {
        _super.call(this, resolutionProvider, timeSource, shaderLoader, shaderUrl);
        this._audioTextureBuffer = new Uint8Array(AudioSource.FFT_SIZE * 4);
        this._audioSource = audioSource;
        this.addSources([this._audioSource]);
        var dataTexture = new THREE.DataTexture(this._audioTextureBuffer, AudioSource.FFT_SIZE, 1, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearMipMapLinearFilter, 1);
        this._audioTextureUniform = {
            name: "audioTexture",
            type: "t",
            value: dataTexture
        };
        this.addUniforms([this._audioTextureUniform]);
    }
    AudioTextureShaderVisualization.prototype.setupVisualizerChain = function () {
        var _this = this;
        this.addDisposable(this._audioSource.SourceObservable
            .subscribe(function (e) {
            AudioUniformFunctions.updateAudioBuffer(e, _this._audioTextureBuffer);
            _this._audioTextureUniform.value.needsUpdate = true;
        }));
    };
    AudioTextureShaderVisualization.prototype.meshObservable = function () {
        return _super.prototype.meshObservable.call(this);
    };
    return AudioTextureShaderVisualization;
})(ShaderVisualization);
/// <reference path="./AudioTextureShaderVisualization"/>
var SimpleVisualization = (function (_super) {
    __extends(SimpleVisualization, _super);
    function SimpleVisualization(audioSource, resolutionProvider, timeSource, options, shaderLoader) {
        _super.call(this, audioSource, resolutionProvider, timeSource, shaderLoader, "simple");
        var colorUniform = {
            name: "color",
            type: "v3",
            value: options && options.color || new THREE.Vector3(1.0, 1.0, 1.0)
        };
        this.addUniforms([colorUniform]);
    }
    SimpleVisualization.prototype.setupVisualizerChain = function () {
        _super.prototype.setupVisualizerChain.call(this);
    };
    SimpleVisualization.prototype.meshObservable = function () {
        return _super.prototype.meshObservable.call(this);
    };
    SimpleVisualization.ID = "simple";
    return SimpleVisualization;
})(AudioTextureShaderVisualization);
/// <reference path="./ShaderVisualization"/>
var DotsVisualization = (function (_super) {
    __extends(DotsVisualization, _super);
    function DotsVisualization(audioSource, resolutionProvider, timeSource, shaderLoader) {
        _super.call(this, resolutionProvider, timeSource, shaderLoader, "dots");
        this._audioSource = audioSource;
        this.addSources([this._audioSource]);
        this._eqSegments = {
            name: "eqSegments",
            type: "v4",
            value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0)
        };
        this._accumulatedLoudness = {
            name: "accumulatedLoudness",
            type: "f",
            value: 0.0
        };
        this._loudness = {
            name: "loudness",
            type: "f",
            value: 0.0
        };
        this.addUniforms([this._eqSegments, this._accumulatedLoudness, this._loudness]);
    }
    DotsVisualization.prototype.setupVisualizerChain = function () {
        var _this = this;
        _super.prototype.setupVisualizerChain.call(this);
        this.addDisposable(this._audioSource.SourceObservable
            .map(function (e) { return AudioUniformFunctions.calculateEqs(e, 4); })
            .subscribe(function (eqs) { return _this._eqSegments.value = eqs; }));
        this.addDisposable(this._audioSource.SourceObservable
            .map(AudioUniformFunctions.calculateLoudness)
            .subscribe(function (loudness) {
            _this._loudness.value = loudness;
            _this._accumulatedLoudness.value += loudness;
        }));
    };
    DotsVisualization.ID = "dots";
    return DotsVisualization;
})(ShaderVisualization);
/// <reference path="./BaseVisualization"/>
/// <reference path="./SimpleVisualization"/>
/// <reference path="./DotsVisualization"/>
var VisualizationManager = (function () {
    function VisualizationManager(audioSource, resolutionProvider, shaderBaseUrl) {
        this._visualizationSubject = new Rx.BehaviorSubject(null);
        this._shaderLoader = new ShaderLoader("no_controls.frag", "util.frag", shaderBaseUrl);
        this._audioSource = audioSource;
        this._timeSource = new TimeSource();
        this._resolutionProvider = resolutionProvider;
    }
    VisualizationManager.prototype.meshObservable = function (optionObservable) {
        var _this = this;
        optionObservable.subscribe(function (__) {
            if (_this._visualizationSubject.getValue() != null) {
                _this._visualizationSubject.getValue().unsubscribe();
            }
        });
        optionObservable
            .filter(function (visualization) { return visualization.id == SimpleVisualization.ID; })
            .map(function (visualizationOption) { return visualizationOption.options; })
            .map(function (options) { return new SimpleVisualization(_this._audioSource, _this._resolutionProvider, _this._timeSource, options, _this._shaderLoader); })
            .subscribe(this._visualizationSubject);
        optionObservable
            .filter(function (visualization) { return visualization.id == DotsVisualization.ID; })
            .map(function (visualizationOption) { return visualizationOption.options; })
            .map(function (options) { return new DotsVisualization(_this._audioSource, _this._resolutionProvider, _this._timeSource, _this._shaderLoader); })
            .subscribe(this._visualizationSubject);
        return this._visualizationSubject.asObservable().filter(function (vis) { return vis != null; }).flatMap(function (visualization) { return visualization.meshObservable(); });
    };
    VisualizationManager.prototype.animate = function () {
        this._visualizationSubject.getValue().animate();
    };
    return VisualizationManager;
})();
/// <reference path='../typed/three.d.ts'/>
/// <reference path='../Models/IPropertiesProvider.ts'/>
/// <reference path='../Models/PropertiesShaderPlane.ts'/>
/// <reference path='../Models/ShaderLoader.ts'/>
/// <reference path='../Models/ResolutionProvider.ts'/>
/// <reference path="../Models/TimeSource"/>
/// <reference path='../Models/AudioUniformProvider.ts'/>
/// <reference path='../Models/LoudnessAccumulator.ts'/>
/// <reference path="../Models/Visualizations/VisualizationManager"/>
var GLController = (function () {
    function GLController(visualizationManager, visualizationOptionObservable, resolutionProvider) {
        var _this = this;
        this._meshSubject = new Rx.BehaviorSubject([]);
        this.MeshObservable = this._meshSubject.asObservable();
        //
        // this._resolutionProvider = new ResolutionProvider();
        // this._timeProvider = new TimeProvider();
        // this._shadersUrl = shadersUrl;
        // this._shaderLoader = new ShaderLoader(
        //   controlsProvider == null ? 'no_controls.frag' : 'controls_init.frag', 'util.frag' , shadersUrl);
        // var audioUniformProvider = new AudioUniformProvider(audioManager);
        //
        // var loudnessAccumulator = new LoudnessAccumulator(audioManager);
        //
        // var properties: Array<IPropertiesProvider<any>> = [
        //   this._resolutionProvider, this._timeProvider,
        //   audioUniformProvider, loudnessAccumulator
        // ];
        //
        // if (videoManager != null) {
        //   properties.push(videoManager);
        // }
        //
        // if (controlsProvider != null) {
        //   controlsProvider.glProperties()
        //     .flatMap(Rx.Observable.from)
        //     .filter((uniform: IUniform<any>) => uniform.name == "volume")
        //     .subscribe(
        //     (volumeUniform: IUniform<number>) => loudnessAccumulator.setVolumeUniform(volumeUniform));
        //
        //   properties.push(controlsProvider);
        // }
        // this._audioShaderPlane = new PropertiesShaderPlane(properties);
        //
        // this._audioShaderPlane.MeshObservable.subscribe((mesh) => this.onNewMeshes([mesh]));
        this._resolutionProvider = resolutionProvider;
        this._visualizationManager = visualizationManager;
        this._visualizationManager.meshObservable(visualizationOptionObservable)
            .subscribe(function (meshes) {
            _this._meshSubject.onNext(meshes);
        });
    }
    GLController.prototype.onNewResolution = function (resolution) {
        this._resolutionProvider.updateResolution(new THREE.Vector2(resolution.width, resolution.height));
    };
    return GLController;
})();
var VideoView = (function () {
    function VideoView(videoController) {
        this._video = document.createElement("video");
        this._video.setAttribute("class", "camera");
        this._video.setAttribute("autoplay", "true");
        this._video.setAttribute("muted", "true");
        // this._video.setAttribute("src", ".ignored/video.mp4")
        this._videoController = videoController;
        navigator["getUserMedia"] = navigator["getUserMedia"] ||
            navigator["webkitGetUserMedia"] ||
            navigator["mozGetUserMedia"];
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
            _this._video.onerror = function (e) { stream.stop(); };
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
    function VideoController(videoManger) {
        this._videoManager = videoManger;
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
    return VideoController;
})();
var VolumeControl = (function () {
    function VolumeControl() {
        this.VolumeLevel = {
            name: "volume",
            type: "f",
            value: 1.0
        };
    }
    VolumeControl.prototype.updateVolume = function (volume) {
        this.VolumeLevel.value = volume;
    };
    return VolumeControl;
})();
var HueControl = (function () {
    function HueControl() {
        this.HueShift = {
            name: "hue",
            type: "f",
            value: 0.0
        };
    }
    HueControl.prototype.updateHueShift = function (shift) {
        this.HueShift.value = shift;
    };
    return HueControl;
})();
/// <reference path='./VolumeControl.ts'/>
/// <reference path='./HueControl.ts'/>
var ControlsProvider = (function () {
    function ControlsProvider() {
        this._volumeControl = new VolumeControl();
        this._hueControl = new HueControl();
    }
    ControlsProvider.prototype.uniforms = function () {
        return [this._volumeControl.VolumeLevel, this._hueControl.HueShift];
    };
    ControlsProvider.prototype.updateVolume = function (volume) {
        this._volumeControl.updateVolume(volume);
    };
    ControlsProvider.prototype.updateHueShift = function (shift) {
        this._hueControl.updateHueShift(shift);
    };
    return ControlsProvider;
})();
/// <reference path='../Models/ControlsProvider.ts'/>
var ControlsController = (function () {
    function ControlsController() {
        this.UniformsProvider = new ControlsProvider();
    }
    ControlsController.prototype.onVolumeChange = function (volume) {
        this.UniformsProvider.updateVolume(parseFloat(volume));
    };
    ControlsController.prototype.onHueShiftChange = function (shift) {
        this.UniformsProvider.updateHueShift(parseFloat(shift));
    };
    return ControlsController;
})();
var ControlsView = (function () {
    function ControlsView(controller) {
        this._controlsController = controller;
    }
    ControlsView.prototype.render = function (el) {
        var container = $("<div>", { class: "controls shader-controls" });
        this.renderVolume(container);
        this.renderHue(container);
        $(el).append(container);
    };
    ControlsView.prototype.renderVolume = function (container) {
        var _this = this;
        var volumeContainer = $("<div>");
        volumeContainer.append("Volume: ");
        var volumeSlider = $("<input>", { type: "range", min: 0, max: 2.0, step: 0.05 });
        volumeSlider.on('input', function (__) {
            _this._controlsController.onVolumeChange(volumeSlider.val());
        });
        volumeContainer.append(volumeSlider);
        container.append(volumeContainer);
    };
    ControlsView.prototype.renderHue = function (container) {
        var _this = this;
        var hueContainer = $("<div>");
        hueContainer.append("Hue: ");
        var hueSlider = $("<input>", { type: "range", min: -0.5, max: 0.5, step: 0.05 });
        hueSlider.on('input', function (__) {
            _this._controlsController.onHueShiftChange(hueSlider.val());
        });
        hueContainer.append(hueSlider);
        container.append(hueContainer);
    };
    return ControlsView;
})();
/// <reference path='../typed/rx.time-lite.d.ts'/>
var VisualizationOptionsController = (function () {
    function VisualizationOptionsController(shaders) {
        this._visualizationOptions = shaders;
        this._visualizationOptionSubject = new Rx.Subject();
        this.VisualizationOptionObservable = this._visualizationOptionSubject.asObservable().startWith(this._visualizationOptions[0]);
        this._currentOption = 0;
        this._currentOptionSubject = new Rx.BehaviorSubject(this._currentOption);
        this.startAutoplayTimer();
    }
    VisualizationOptionsController.prototype.shaderNames = function () {
        var shaderNames = [];
        this._visualizationOptions.forEach(function (shader) { return shaderNames.push(shader.name); });
        return shaderNames;
    };
    VisualizationOptionsController.prototype.currentShaderObservable = function () {
        return this._currentOptionSubject.asObservable();
    };
    VisualizationOptionsController.prototype.onOptionName = function (shaderName) {
        for (var i = 0; i < this._visualizationOptions.length; i++) {
            if (this._visualizationOptions[i].name == shaderName) {
                this.updateOption(i);
                break;
            }
        }
    };
    VisualizationOptionsController.prototype.updateOption = function (index) {
        if (this._currentOption == index) {
            return;
        }
        var option = this._visualizationOptions[index];
        if (option != undefined) {
            this._currentOption = index;
            this._currentOptionSubject.onNext(this._currentOption);
            this._visualizationOptionSubject.onNext(option);
        }
    };
    VisualizationOptionsController.prototype.onAutoplayChanged = function (autoplay) {
        if (autoplay) {
            this.startAutoplayTimer();
        }
        else {
            this._autoplaySub.dispose();
        }
    };
    VisualizationOptionsController.prototype.startAutoplayTimer = function () {
        var _this = this;
        this._autoplaySub = Rx.Observable.timer(30000).subscribe(function (__) {
            _this.updateOption(((1 + _this._currentOption) % _this._visualizationOptions.length));
            _this.startAutoplayTimer();
        });
    };
    return VisualizationOptionsController;
})();
/// <reference path="../Controllers/VisualizationOptionsController"/>
var VisualizationOptionsView = (function () {
    function VisualizationOptionsView(shadersController) {
        this._shadersController = shadersController;
    }
    VisualizationOptionsView.prototype.render = function (el) {
        var _this = this;
        var container = $("<div>", { class: "shaders" });
        // Select for all of the shaders
        var select = $("<select />");
        select.change(function (__) {
            return _this._shadersController.onOptionName(select.find('option:selected').val());
        });
        this._shadersController.shaderNames().forEach(function (shaderName) {
            return select.append("<option value=\"" + shaderName + "\">" + shaderName + "</option>");
        });
        container.append(select);
        // Autoplay to enable autoplay
        var autoplay = $("<label>", { text: "Autoplay" });
        var input = $("<input/>", {
            type: "checkbox",
            checked: true
        });
        input.change(function () {
            _this._shadersController.onAutoplayChanged(input.is(":checked"));
        });
        this._shadersController.currentShaderObservable().subscribe(function (ind) {
            select.children().eq(ind).prop('selected', true);
        });
        autoplay.prepend(input);
        container.append(autoplay);
        $(el).append(container);
    };
    return VisualizationOptionsView;
})();
/// <reference path="./PlayerView.ts"/>
/// <reference path="./PlaylistView.ts"/>
/// <reference path="../Controllers/PlayerController.ts"/>
/// <reference path="./GLView.ts"/>
/// <reference path="../Controllers/GLController.ts"/>
/// <reference path="./VideoView.ts"/>
/// <reference path="../Controllers/VideoController.ts"/>
/// <reference path="../Controllers/ControlsController.ts"/>
/// <reference path="./ControlsView.ts"/>
/// <reference path="../Controllers/VisualizationOptionsController.ts"/>
/// <reference path="./VisualizationOptionsView.ts"/>
/// <reference path="./ControlsView.ts"/>
/// <reference path='./IControllerView.ts' />
/// <reference path='../Models/AudioSource.ts' />
/// <reference path='../Models/Track.ts' />
/// <reference path="../Models/VisualizationOption"/>
var GLVis;
(function (GLVis) {
    var FileInput = (function () {
        function FileInput(tracks, shaders, shaderUrl) {
            this.content = $("<div>");
            window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
            var audioSource = new AudioSource(new AudioContext());
            var resolutionProvider = new ResolutionProvider();
            this._visualizationManager = new VisualizationManager(audioSource, resolutionProvider, shaderUrl);
            this._playerController = new PlayerController(tracks, audioSource);
            this._visualizationOptionsController = new VisualizationOptionsController(shaders);
            this._glController =
                new GLController(this._visualizationManager, this._visualizationOptionsController.VisualizationOptionObservable, resolutionProvider);
            this._playerView = new PlayerView(this._playerController);
            this._playlistView = new PlaylistView(this._playerController);
            this._glView = new GLView(this._glController);
            this._visualizationOptionsView = new VisualizationOptionsView(this._visualizationOptionsController);
        }
        FileInput.prototype.render = function (el) {
            var _this = this;
            this._playerView.render(this.content[0]);
            this._playlistView.render(this.content[0]);
            this._glView.render(this.content[0]);
            this._visualizationOptionsView.render(this.content[0]);
            $(el).append(this.content);
            requestAnimationFrame(function () { return _this.animate(); });
        };
        FileInput.prototype.animate = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this.animate(); });
            this._visualizationManager.animate();
            this._glView.animate();
        };
        return FileInput;
    })();
    GLVis.FileInput = FileInput;
})(GLVis || (GLVis = {}));
