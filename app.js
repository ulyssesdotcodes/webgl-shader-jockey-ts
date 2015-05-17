var MicrophoneController = (function () {
    function MicrophoneController(manager) {
        var _this = this;
        this._manager = manager;
        this.microphone = new Microphone(manager.context);
        this.microphone.nodeObservable().subscribe(function (node) { return _this._manager.updateSourceNode(node, false); });
        this.microphone.onContext(manager.context);
    }
    return MicrophoneController;
})();
/// <reference path="./IUniform.ts"/>
/// <reference path='./IPropertiesProvider.ts' />
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
        this._glController.MeshObservable
            .scan(new THREE.Object3D(), function (obj, meshes) {
            obj = new THREE.Object3D();
            meshes.forEach(function (mesh) { return obj.add(mesh); });
            obj.position = new THREE.Vector3(0, 0, 0);
            return obj;
        })
            .subscribe(function (obj) {
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
        Rx.Observable.from(this._propertiesProviders)
            .flatMap(function (provider) { return provider.glProperties(); })
            .scan({}, function (acc, properties) {
            properties.forEach(function (property) { return acc[property.name] = property; });
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
        Rx.Observable.combineLatest(this._shaderSubject, this._uniformsManager.UniformsObservable, function (shaderText, uniforms) {
            var fragText = shaderText.fragmentShader;
            Object.keys(uniforms).forEach(function (key) {
                var uniform = uniforms[key];
                var uniformType;
                switch (uniform.type) {
                    case "f":
                        uniformType = "float";
                        break;
                    case "v2":
                        uniformType = "vec2";
                        break;
                    case "t":
                        uniformType = "sampler2D";
                        break;
                }
                fragText = "uniform " + uniformType + " " + uniform.name + ";\n" + fragText;
            });
            return new THREE.ShaderMaterial({
                uniforms: uniforms,
                fragmentShader: fragText,
                vertexShader: shaderText.vertextShader
            });
        })
            .map(function (shader) { return new ShaderPlane(shader).mesh; })
            .subscribe(this._meshSubject);
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
        return $.getAsObservable('shaders/' + name + ".vert")
            .map(function (shader) { return shader.data; })
            .onErrorResumeNext(Rx.Observable.just(this._regularVert));
    };
    ShaderLoader.prototype.getFragment = function (name) {
        return $.getAsObservable('shaders/' + name + '.frag')
            .map(function (shader) { return shader.data; })
            .combineLatest(this.utilFrag(), function (frag, util) { return util.concat(frag); });
    };
    ShaderLoader.prototype.utilFrag = function () {
        var _this = this;
        if (this._utilFrag === undefined) {
            return $.getAsObservable('shaders/util.frag')
                .map(function (shader) { return shader.data; })
                .doOnNext(function (util) { return _this._utilFrag = util; });
        }
        return Rx.Observable.just(this._utilFrag);
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
    function GLController(audioManager, videoManager, controlsProvider) {
        var _this = this;
        this._meshSubject = new Rx.Subject();
        this.MeshObservable = this._meshSubject.asObservable();
        this._resolutionProvider = new ResolutionProvider();
        this._timeProvider = new TimeProvider();
        this._shaderLoader = new ShaderLoader();
        var audioUniformProvider = new AudioUniformProvider(audioManager);
        var loudnessAccumulator = new LoudnessAccumulator(audioManager);
        controlsProvider.glProperties()
            .flatMap(Rx.Observable.from)
            .filter(function (uniform) { return uniform.name == "volume"; })
            .subscribe(function (volumeUniform) { return loudnessAccumulator.setVolumeUniform(volumeUniform); });
        this._audioShaderPlane = new PropertiesShaderPlane([
            videoManager, this._resolutionProvider, this._timeProvider,
            audioUniformProvider, loudnessAccumulator, controlsProvider
        ]);
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
        this._shaderLoader.getShaderFromServer(name)
            .subscribe(function (shader) { return _this._audioShaderPlane.onShaderText(shader); });
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
        this._shadersController = shadersController;
    }
    ShadersView.prototype.render = function (el) {
        var _this = this;
        var container = $("<div>", { class: "shaders" });
        var select = $("<select />");
        select.change(function (__) {
            return _this._shadersController.onShaderName(select.find('option:selected').val());
        });
        ShadersView.shaders.forEach(function (shaderName) {
            return select.append("<option value=\"" + shaderName + "\">" + shaderName + "</option>");
        });
        container.append(select);
        $(el).append(container);
    };
    ShadersView.shaders = [
        "simple", "fft_matrix_product", "circular_fft", "vertical_wav", "threejs_test",
        "video_test", "video_audio_distortion", "loudness_test", "mandelbrot",
        "mandelbrot_mover"
    ];
    return ShadersView;
})();
var VideoView = (function () {
    function VideoView(videoController) {
        this._video = document.createElement("video");
        this._video.setAttribute("class", "camera");
        this._video.setAttribute("autoplay", "true");
        this._video.setAttribute("muted", "true");
        this._video.setAttribute("src", ".ignored/video.mp4");
        this._videoController = videoController;
        navigator["getUserMedia"] = navigator["getUserMedia"] ||
            navigator["webkitGetUserMedia"] ||
            navigator["mozGetUserMedia"];
        window["URL"] = window["URL"] || window["webkitURL"];
    }
    VideoView.prototype.render = function (el) {
        // var gotStream = (stream) => {
        // 	if (window["URL"])
        // 	{   this._video.src = window["URL"].createObjectURL(stream);   }
        // 	else // Opera
        // 	{   this._video.src = stream;   }
        //
        // 	this._video.onerror = function(e)
        // 	{   stream.stop();   };
        // }
        // navigator["getUserMedia"]({audio: false, video: true}, gotStream, console.log);
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
    ControlsProvider.prototype.glProperties = function () {
        return Rx.Observable.just([this._volumeControl.VolumeLevel, this._hueControl.HueShift]);
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
var AudioAnalyser = (function () {
    function AudioAnalyser(context, fftSize) {
        this._analyser = context.createAnalyser();
        this.fftSize = fftSize;
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
var AudioManager = (function () {
    function AudioManager(audioContext) {
        this._audioContext = audioContext;
        this._audioAnalyser = new AudioAnalyser(this._audioContext, AudioManager.FFT_SIZE);
        this._audioEventSubject = new Rx.Subject();
        this.AudioEventObservable = this._audioEventSubject.asObservable();
    }
    AudioManager.prototype.updateSourceNode = function (sourceNode, connectToDestination) {
        this._audioAnalyser.connectSource(sourceNode);
        if (connectToDestination) {
            this._audioAnalyser.connectDestination(this._audioContext.destination);
        }
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
/// <reference path="../Controllers/MicrophoneController.ts"/>
/// <reference path="./GLView.ts"/>
/// <reference path="../Controllers/GLController.ts"/>
/// <reference path="./ShadersView.ts"/>
/// <reference path="./VideoView.ts"/>
/// <reference path="../Controllers/VideoController.ts"/>
/// <reference path="../Controllers/ControlsController.ts"/>
/// <reference path="./ControlsView.ts"/>
/// <reference path='./IControllerView.ts' />
/// <reference path='../Models/AudioManager.ts' />
var Visualizer = (function () {
    function Visualizer() {
        var _this = this;
        this.content = $("<div>", { text: "Hello, world!" });
        window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
        this._audioManager = new AudioManager(new AudioContext());
        var micController = new MicrophoneController(this._audioManager);
        this._videoController = new VideoController();
        this._shadersController = new ShadersController();
        this._controlsController = new ControlsController();
        this._glController = new GLController(this._audioManager, this._videoController.Manager, this._controlsController.UniformsProvider);
        this._glView = new GLView(this._audioManager, this._glController);
        this._shadersView = new ShadersView(this._shadersController);
        this._controlsView = new ControlsView(this._controlsController);
        this._videoView = new VideoView(this._videoController);
        this._shadersController.ShaderNameObservable.subscribe(function (name) {
            return _this._glController.onShaderName(name);
        });
    }
    Visualizer.prototype.render = function (el) {
        var _this = this;
        this._glView.render(this.content[0]);
        this._shadersView.render(this.content[0]);
        this._controlsView.render(this.content[0]);
        this._videoView.render(this.content[0]);
        $(el).append(this.content);
        requestAnimationFrame(function () { return _this.animate(); });
    };
    Visualizer.prototype.animate = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.animate(); });
        this._audioManager.sampleAudio();
        this._videoController.sampleVideo();
        this._glView.animate();
    };
    return Visualizer;
})();
/// <reference path="./typed/jquery.d.ts"/>
/// <reference path="./typed/rx.d.ts"/>
/// <reference path="./typed/waa.d.ts"/>
/// <reference path="./typed/soundcloud.d.ts"/>
/// <reference path="./Views/Visualizer.ts"/>
function exec() {
    "use strict";
    // var app: Visualizer = new FileVisualizer(['.ignored/learning_to_love.mp3', '.ignored/test_song.mp3']);
    var app = new Visualizer();
    app.render($("#content")[0]);
}
$(document).ready(function () {
    exec();
});
