var GLView = (function () {
    function GLView(glController) {
        this._glController = glController;
        this._scene = new THREE.Scene();
        this._renderer = new THREE.WebGLRenderer();
    }
    GLView.prototype.renderer = function () {
        return this._renderer;
    };
    GLView.prototype.render = function (el) {
        var _this = this;
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 350);
        this._camera.position.z = 100;
        this._camera.position.z = 100;
        var sceneContainer = new THREE.Object3D();
        this._scene.add(sceneContainer);
        this._glController.MeshObservable.scan(function (obj, meshes) {
            obj = new THREE.Object3D();
            meshes.forEach(function (mesh) { return obj.add(mesh); });
            obj.position = new THREE.Vector3(0, 0, 0);
            return obj;
        }, new THREE.Object3D()).subscribe(function (obj) {
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
/// <reference path="../IUniform.ts"/>
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
    function ShaderLoader(utilsUrl, shadersUrl) {
        this._shadersUrl = shadersUrl;
        this._utilsUrl = shadersUrl + utilsUrl;
    }
    ShaderLoader.prototype.getVariedShaderFromServer = function (fragmentUrl, vertexUrl) {
        return Rx.Observable.zip(this.getFragment(fragmentUrl), this.getVertex(vertexUrl), function (frag, vert) { return new ShaderText(frag, vert); });
    };
    ShaderLoader.prototype.getShaderFromServer = function (url) {
        return Rx.Observable.zip(this.getFragment(url), this.getVertex(url), function (frag, vert) { return new ShaderText(frag, vert); });
    };
    ShaderLoader.prototype.getVertex = function (url) {
        return $.getAsObservable(this._shadersUrl + url + ".vert").map(function (shader) { return shader.data; }).onErrorResumeNext(this.getPlane());
    };
    ShaderLoader.prototype.getFragment = function (url) {
        return $.getAsObservable(this._shadersUrl + url + '.frag').map(function (shader) { return shader.data; }).combineLatest(this.utilFrag(), function (frag, util) { return util.concat(frag); });
    };
    ShaderLoader.prototype.getPlane = function () {
        var _this = this;
        if (this._regularVert) {
            return Rx.Observable.just(this._regularVert);
        }
        return $.getAsObservable(this._shadersUrl + "plane.vert").map(function (shader) { return shader.data; }).doOnNext(function (vert) {
            _this._regularVert = vert;
        });
    };
    ShaderLoader.prototype.utilFrag = function () {
        var _this = this;
        if (this._utilFrag === undefined) {
            return $.getAsObservable(this._utilsUrl).map(function (shader) { return shader.data; }).doOnNext(function (util) { return _this._utilFrag = util; });
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
    ResolutionProvider.prototype.uniforms = function () {
        return [this._resolutionProperty];
    };
    ResolutionProvider.prototype.updateResolution = function (resolution) {
        this._resolutionProperty.value = resolution;
    };
    return ResolutionProvider;
})();
/// <reference path="./Source"/>
var TimeSource = (function () {
    function TimeSource() {
        this._startTime = Date.now();
        this._timeSubject = new Rx.Subject();
    }
    TimeSource.prototype.observable = function () {
        return this._timeSubject.asObservable();
    };
    TimeSource.prototype.animate = function () {
        this._timeSubject.onNext((Date.now() - this._startTime) / 1000.0);
    };
    return TimeSource;
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
        audioManager.observable().subscribe(function (ae) { return _this.onAudioEvent(ae); });
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
        this._created = false;
        this._sources = [];
        this._disposable = new Rx.CompositeDisposable();
    }
    BaseVisualization.prototype.addSources = function (sources) {
        this._sources = this._sources.concat(sources);
    };
    BaseVisualization.prototype.addDisposable = function (disposable) {
        this._disposable.add(disposable);
    };
    BaseVisualization.prototype.onCreated = function () {
        this._created = true;
    };
    BaseVisualization.prototype.animate = function () {
        if (this._created) {
            this._sources.forEach(function (source) { return source.animate(); });
        }
    };
    BaseVisualization.prototype.object3DObservable = function () {
        console.log("Yo, you forgot to implement meshObservable().");
        return null;
    };
    BaseVisualization.prototype.unsubscribe = function () {
        this._disposable.dispose();
    };
    BaseVisualization.prototype.rendererId = function () {
        return "";
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
    function calculateEqs(e, segments) {
        if (e.frequencyBuffer !== undefined) {
            var vec = [];
            for (var i = 0; i < segments; i++) {
                vec.push(0);
            }
            var segmentSize = e.frequencyBuffer.length * 0.5 / segments;
            for (var i = 0; i < segmentSize * segments; i++) {
                var val = e.frequencyBuffer[i];
                vec[Math.floor(i / segmentSize)] += val * val / (255 - ((255 - val) * i / (segmentSize * segments)));
            }
            for (i = 0; i < vec.length; i++) {
                vec[i] = vec[i] / (256.0 * segmentSize);
            }
            return vec;
        }
        return new Array(e.frequencyBuffer.length);
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
/// <reference path="./Attribute"/>
var UniformUtils = (function () {
    function UniformUtils() {
    }
    UniformUtils.createShaderMaterialUniforms = function (shader, uniforms) {
        return this.createShaderMaterialUniformsAttributes(shader, uniforms, []);
    };
    UniformUtils.createShaderMaterialUniformsAttributes = function (shader, uniforms, attributes) {
        var fragText = shader.fragmentShader;
        var vertText = shader.vertexShader;
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
                case "c":
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
            vertText = "uniform " + uniformType + " " + uniform.name + ";\n" + vertText;
        });
        var attributeObject = {};
        attributes.forEach(function (attribute) { return attributeObject[attribute.name] = attribute; });
        Object.keys(attributeObject).forEach(function (key) {
            var attribute = attributeObject[key];
            var uniformType;
            switch (attribute.type) {
                case "f":
                    uniformType = "float";
                    break;
                case "v2":
                    uniformType = "vec2";
                    break;
                case "c":
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
            vertText = "attribute " + uniformType + " " + attribute.name + ";\n" + vertText;
        });
        return new THREE.ShaderMaterial({
            uniforms: uniformObject,
            attributes: attributeObject,
            fragmentShader: fragText,
            vertexShader: vertText
        });
    };
    return UniformUtils;
})();
/// <reference path="./UniformUtils"/>
var ShaderPlane = (function () {
    function ShaderPlane(shader, uniforms) {
        var shaderMaterial = UniformUtils.createShaderMaterialUniforms(shader, uniforms);
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
/// <reference path="./AudioUniformFunctions" />
/// <reference path="../ShaderPlane"/>
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
        this.addDisposable(this._timeSource.observable().subscribe(function (time) {
            _this._timeUniform.value = time;
        }));
    };
    ShaderVisualization.prototype.addUniforms = function (uniforms) {
        this._uniforms = this._uniforms.concat(uniforms);
    };
    ShaderVisualization.prototype.animate = function () {
        _super.prototype.animate.call(this);
        return {
            type: this.rendererId(),
            uniforms: this._uniforms
        };
    };
    ShaderVisualization.prototype.object3DObservable = function () {
        var _this = this;
        return Rx.Observable.create(function (observer) {
            _this.setupVisualizerChain();
            _this._shaderLoader.getShaderFromServer(_this._shaderUrl).map(function (shader) { return new ShaderPlane(shader, _this._uniforms); }).doOnNext(function (__) { return _this.onCreated(); }).map(function (shaderplane) { return [shaderplane.mesh]; }).subscribe(observer);
        });
    };
    ShaderVisualization.prototype.rendererId = function () {
        return IDs.shader;
    };
    return ShaderVisualization;
})(BaseVisualization);
/// <reference path="./ShaderVisualization"/>
var AudioTextureShaderVisualization = (function (_super) {
    __extends(AudioTextureShaderVisualization, _super);
    function AudioTextureShaderVisualization(audioSource, resolutionProvider, timeSource, shaderLoader, shaderUrl, controlsProvider) {
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
        _super.prototype.setupVisualizerChain.call(this);
        this.addDisposable(this._audioSource.observable().subscribe(function (e) {
            AudioUniformFunctions.updateAudioBuffer(e, _this._audioTextureBuffer);
            _this._audioTextureUniform.value.needsUpdate = true;
        }));
    };
    AudioTextureShaderVisualization.prototype.object3DObservable = function () {
        return _super.prototype.object3DObservable.call(this);
    };
    return AudioTextureShaderVisualization;
})(ShaderVisualization);
/// <reference path="./AudioTextureShaderVisualization"/>
var SimpleVisualization = (function (_super) {
    __extends(SimpleVisualization, _super);
    function SimpleVisualization(audiosource, resolutionprovider, timesource, options, shaderloader, controlsProvider) {
        _super.call(this, audiosource, resolutionprovider, timesource, shaderloader, "simple", controlsProvider);
        var coloruniform = {
            name: "color",
            type: "v3",
            value: options && options.color || new THREE.Vector3(1.0, 1.0, 1.0)
        };
        this.addUniforms([coloruniform]);
        if (controlsProvider) {
            controlsProvider.newControls([]);
        }
    }
    SimpleVisualization.prototype.setupvisualizerchain = function () {
        _super.prototype.setupVisualizerChain.call(this);
    };
    SimpleVisualization.prototype.object3DObservable = function () {
        return _super.prototype.object3DObservable.call(this);
    };
    SimpleVisualization.prototype.rendererId = function () {
        return IDs.shader;
    };
    SimpleVisualization.ID = "simple";
    return SimpleVisualization;
})(AudioTextureShaderVisualization);
var IDs = (function () {
    function IDs() {
    }
    IDs.dots = "dots";
    IDs.circles = "circles";
    IDs.shader = "shader";
    IDs.eqPointCloud = "eqPointCloud";
    IDs.videoDistortion = "videoDistortion";
    return IDs;
})();
/// <reference path="./IDs"/>
/// <reference path="./ShaderVisualization"/>
var DotsVisualization = (function (_super) {
    __extends(DotsVisualization, _super);
    function DotsVisualization(audioSource, resolutionProvider, timeSource, shaderLoader, controlsProvider) {
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
        if (controlsProvider) {
            controlsProvider.newControls([]);
        }
    }
    DotsVisualization.prototype.setupVisualizerChain = function () {
        var _this = this;
        _super.prototype.setupVisualizerChain.call(this);
        this.addDisposable(this._audioSource.observable().map(function (e) { return AudioUniformFunctions.calculateEqs(e, 4); }).map(function (eqs) { return new THREE.Vector4(eqs[0], eqs[1], eqs[2], eqs[3]); }).subscribe(function (eqs) { return _this._eqSegments.value = eqs; }));
        this.addDisposable(this._audioSource.observable().map(AudioUniformFunctions.calculateLoudness).subscribe(function (loudness) {
            _this._loudness.value = loudness;
            _this._accumulatedLoudness.value += loudness;
        }));
    };
    DotsVisualization.prototype.rendererId = function () {
        return IDs.shader;
    };
    DotsVisualization.ID = IDs.dots;
    return DotsVisualization;
})(ShaderVisualization);
/// <reference path="./AudioTextureShaderVisualization"/>
/// <reference path="../Sources/TimeSource"/>
var CirclesVisualization = (function (_super) {
    __extends(CirclesVisualization, _super);
    function CirclesVisualization(audioSource, resolutionProvider, timeSource, shaderLoader, controlsProvider) {
        _super.call(this, audioSource, resolutionProvider, timeSource, shaderLoader, "circular_fft", controlsProvider);
        this._accumulatedLoudness = {
            name: "accumulatedLoudness",
            type: "f",
            value: 0.0
        };
        this.addUniforms([this._accumulatedLoudness]);
        if (controlsProvider) {
            controlsProvider.newControls([Controls.volume, Controls.hue]);
            this.addUniforms(controlsProvider.uniforms());
        }
    }
    CirclesVisualization.prototype.setupVisualizerChain = function () {
        var _this = this;
        _super.prototype.setupVisualizerChain.call(this);
        this.addDisposable(this._audioSource.observable().map(AudioUniformFunctions.calculateLoudness).subscribe(function (loudness) {
            _this._accumulatedLoudness.value += loudness;
        }));
    };
    CirclesVisualization.prototype.object3DObservable = function () {
        return _super.prototype.object3DObservable.call(this);
    };
    CirclesVisualization.prototype.rendererId = function () {
        return IDs.shader;
    };
    return CirclesVisualization;
})(AudioTextureShaderVisualization);
var VideoSource = (function () {
    function VideoSource() {
        this._creating = false;
        this._created = false;
        this._videoElement = document.createElement("video");
        this._videoElement.setAttribute("class", "camera");
        this._videoElement.setAttribute("autoplay", "true");
        this._videoElement.setAttribute("muted", "true");
        this._videoCanvas = document.createElement("canvas");
        this._videoCanvas.width = 1024;
        this._videoCanvas.height = 1024;
        this._videoContext = this._videoCanvas.getContext("2d");
        var texture = new THREE.Texture(this._videoCanvas);
        this._videoTexture = {
            name: "camera",
            type: "t",
            value: texture
        };
        this._videoResolution = {
            name: "cameraResolution",
            type: "v2",
            value: new THREE.Vector2(0, 0)
        };
        navigator["getUserMedia"] = navigator["getUserMedia"] || navigator["webkitGetUserMedia"] || navigator["mozGetUserMedia"];
        window["URL"] = window["URL"] || window["webkitURL"];
    }
    VideoSource.prototype.createVideoSource = function () {
        var _this = this;
        this._creating = true;
        var gotStream = function (stream) {
            _this._creating = false;
            _this._created = true;
            if (window["URL"]) {
                _this._videoElement.src = window["URL"].createObjectURL(stream);
            }
            else {
                _this._videoElement.src = stream;
            }
            _this._videoElement.onerror = function (e) {
                stream.stop();
            };
        };
        navigator["getUserMedia"]({ audio: false, video: true }, gotStream, console.log);
    };
    VideoSource.prototype.uniforms = function () {
        return [this._videoTexture, this._videoResolution];
    };
    VideoSource.prototype.observable = function () {
        return Rx.Observable.just(this._videoTexture.value);
    };
    VideoSource.prototype.animate = function () {
        if (!(this._created || this._creating)) {
            this.createVideoSource();
            return;
        }
        if (this._creating) {
            return;
        }
        this._videoContext.drawImage(this._videoElement, 0, 0, this._videoCanvas.width, this._videoCanvas.height);
        this._videoResolution.value.set(this._videoElement.videoWidth, this._videoElement.videoHeight);
        this._videoTexture.value.needsUpdate = true;
    };
    return VideoSource;
})();
/// <reference path="../Sources/VideoSource"/>
var VideoDistortionVisualization = (function (_super) {
    __extends(VideoDistortionVisualization, _super);
    function VideoDistortionVisualization(videoSource, audioSource, resolutionProvider, timeSource, shaderLoader, controlsProvider) {
        _super.call(this, audioSource, resolutionProvider, timeSource, shaderLoader, "video_audio_distortion");
        this.addSources([videoSource]);
        this.addUniforms(videoSource.uniforms());
        if (controlsProvider) {
            controlsProvider.newControls([Controls.volume, Controls.hue]);
            this.addUniforms(controlsProvider.uniforms());
        }
    }
    VideoDistortionVisualization.ID = "videoDistortion";
    return VideoDistortionVisualization;
})(AudioTextureShaderVisualization);
var Controls;
(function (Controls) {
    Controls.volume = {
        name: "volume",
        min: 0.0,
        max: 2.0,
        defVal: 1.0
    };
    Controls.hue = {
        name: "hue",
        min: -0.5,
        max: 0.5,
        defVal: 0.0
    };
})(Controls || (Controls = {}));
/// <reference path="../Sources/VideoSource"/>
/// <reference path="../Controls"/>
var VideoAudioSpiralVisualization = (function (_super) {
    __extends(VideoAudioSpiralVisualization, _super);
    function VideoAudioSpiralVisualization(videoSource, audioSource, resolutionProvider, timeSource, shaderLoader, controlsProvider) {
        _super.call(this, audioSource, resolutionProvider, timeSource, shaderLoader, "video_audio_spiral");
        this.addSources([videoSource]);
        this.addUniforms(videoSource.uniforms());
        this._loudness = {
            name: "loudness",
            type: "f",
            value: 0.0
        };
        this.addUniforms([this._loudness]);
        if (controlsProvider) {
            controlsProvider.newControls([Controls.volume, Controls.hue]);
            this.addUniforms(controlsProvider.uniforms());
        }
    }
    VideoAudioSpiralVisualization.prototype.setupVisualizerChain = function () {
        var _this = this;
        _super.prototype.setupVisualizerChain.call(this);
        this.addDisposable(this._audioSource.observable().map(AudioUniformFunctions.calculateLoudness).subscribe(function (loudness) {
            _this._loudness.value = loudness;
        }));
    };
    VideoAudioSpiralVisualization.ID = "videoAudioSpiral";
    return VideoAudioSpiralVisualization;
})(AudioTextureShaderVisualization);
var SquareVisualization = (function (_super) {
    __extends(SquareVisualization, _super);
    function SquareVisualization(audioSource, resolutionProvider, timeSource, shaderLoader, controlsProvider) {
        _super.call(this, audioSource, resolutionProvider, timeSource, shaderLoader, "fft_matrix_product");
        if (controlsProvider) {
            controlsProvider.newControls([Controls.volume, Controls.hue]);
            this.addUniforms(controlsProvider.uniforms());
        }
    }
    SquareVisualization.ID = "squared";
    return SquareVisualization;
})(AudioTextureShaderVisualization);
/// <reference path="../Attribute"/>
var PointCloudVisualization = (function (_super) {
    __extends(PointCloudVisualization, _super);
    function PointCloudVisualization(resolutionProvider, timeSource, shaderLoader, shaderurl, controlsProvider) {
        _super.call(this);
        this._shaderLoader = shaderLoader;
        this._shaderUrl = shaderurl;
        this._timeSource = timeSource;
        this.addSources([this._timeSource]);
        this._resolutionProvider = resolutionProvider;
        this._timeUniform = {
            name: "time",
            type: "f",
            value: 0.0
        };
        this._uniforms = [this._timeUniform].concat(resolutionProvider.uniforms());
        this._attributes = [];
        if (controlsProvider) {
            this.addUniforms(controlsProvider.uniforms());
        }
    }
    PointCloudVisualization.prototype.addUniforms = function (uniforms) {
        this._uniforms = this._uniforms.concat(uniforms);
    };
    PointCloudVisualization.prototype.addAttributes = function (attributes) {
        this._attributes = this._attributes.concat(attributes);
    };
    PointCloudVisualization.prototype.setupVisualizerChain = function () {
        var _this = this;
        this.addDisposable(this._timeSource.observable().subscribe(function (time) {
            _this._timeUniform.value = time;
        }));
        this.addDisposable(this._timeSource.observable().subscribe(function (time) {
            _this._timeUniform.value = time;
        }));
    };
    PointCloudVisualization.prototype.createPointCloudVisualization = function (shaderMaterial) {
        console.log("This is a really boring pointcloud");
        return [];
    };
    PointCloudVisualization.prototype.createPointCloud = function (points, material, pos) {
        var geometry = new THREE.Geometry();
        for (var i = 0; i < points; i++) {
            geometry.vertices.push(pos.call(i));
        }
        return new THREE.PointCloud(geometry, material);
    };
    PointCloudVisualization.prototype.object3DObservable = function () {
        var _this = this;
        return Rx.Observable.create(function (observer) {
            _this.setupVisualizerChain();
            _this._shaderLoader.getShaderFromServer(_this._shaderUrl).map(function (shaderText) { return UniformUtils.createShaderMaterialUniformsAttributes(shaderText, _this._uniforms, _this._attributes); }).map(function (material) { return _this.createPointCloudVisualization(material); }).doOnNext(function (__) { return _this.onCreated(); }).subscribe(observer);
        });
    };
    return PointCloudVisualization;
})(BaseVisualization);
/// <reference path="./PointCloudVisualization"/>
var EqPointCloud = (function (_super) {
    __extends(EqPointCloud, _super);
    function EqPointCloud(audioSource, resolutionProvider, timeSource, shaderLoader, controlsProvider) {
        _super.call(this, resolutionProvider, timeSource, shaderLoader, "eq_pointcloud", controlsProvider);
        this._audioSource = audioSource;
        this.addSources([this._audioSource]);
        this._colorBuffer = new Array(EqPointCloud.POINT_COUNT);
        for (var i = 0; i < EqPointCloud.POINT_COUNT; i++) {
            this._colorBuffer[i] = new THREE.Color(1.3, 0.3, 0.3);
        }
        var colorAttribute = {
            name: "color",
            type: "c",
            value: this._colorBuffer
        };
        this.addAttributes([colorAttribute]);
        this._eqs = {
            name: "eqs",
            type: "v3",
            value: new THREE.Vector3()
        };
        this._eq1 = {
            name: "eq1",
            type: "v3",
            value: new THREE.Vector3()
        };
        this._eq2 = {
            name: "eq2",
            type: "v3",
            value: new THREE.Vector3()
        };
        this._eq3 = {
            name: "eq3",
            type: "v3",
            value: new THREE.Vector3()
        };
        this.addUniforms([this._eqs, this._eq1, this._eq2, this._eq3]);
        if (controlsProvider) {
            this._controlsProvider = controlsProvider;
            this._controlsProvider.newControls([
                {
                    name: "size",
                    min: 0.0,
                    max: 2.0,
                    defVal: 1.0
                },
                {
                    name: "power",
                    min: 0.6,
                    max: 2.4,
                    defVal: 1.2
                },
                {
                    name: "rotationSpeed",
                    min: 0.4,
                    max: 2.4,
                    defVal: 1.0
                }
            ]);
            this.addUniforms(controlsProvider.uniforms());
        }
    }
    EqPointCloud.prototype.setupVisualizerChain = function () {
        var _this = this;
        _super.prototype.setupVisualizerChain.call(this);
        this.addDisposable(this._audioSource.observable().map(function (e) { return AudioUniformFunctions.calculateEqs(e, 3); }).subscribe(function (eqs) {
            _this._eqs.value = new THREE.Vector3(eqs[0], eqs[1], eqs[2]);
        }));
        this.addDisposable(this._audioSource.observable().map(function (e) { return AudioUniformFunctions.calculateLoudness(e); }).subscribe(function (l) { return _this._loudness = l; }));
    };
    EqPointCloud.prototype.createPointCloudVisualization = function (shaderMaterial) {
        this._material = shaderMaterial;
        this._pc = this.createPointCloud(EqPointCloud.POINT_COUNT, shaderMaterial, function (i) { return new THREE.Vector3(Math.random() * EqPointCloud.CUBE_SIZE - EqPointCloud.CUBE_SIZE * 0.5, Math.random() * EqPointCloud.CUBE_SIZE - EqPointCloud.CUBE_SIZE * 0.5, Math.random() * EqPointCloud.CUBE_SIZE - EqPointCloud.CUBE_SIZE * 0.5); });
        this._vertices = this._pc.geometry.vertices;
        this._eq1.value = this._vertices[0];
        this._eq2.value = this._vertices[1];
        this._eq3.value = this._vertices[2];
        this._eq1Vel = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        this._eq2Vel = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        this._eq3Vel = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        this._colorBuffer[0].r = 1.0;
        this._colorBuffer[1].g = 1.0;
        this._colorBuffer[2].b = 1.0;
        return [this._pc];
    };
    EqPointCloud.prototype.animate = function () {
        _super.prototype.animate.call(this);
        if (this._material) {
            this._material.attributes.color.needsUpdate = true;
        }
        if (this._pc) {
            this._pc.rotateY(this._controlsProvider.getValue("rotationSpeed") / 128.0);
            this._pc.rotateX(this._controlsProvider.getValue("rotationSpeed") / 256.0);
            this.updateEqWithVelocity(this._eq1, this._eq1Vel, this._eqs.value.x);
            this.updateEqWithVelocity(this._eq2, this._eq2Vel, this._eqs.value.y);
            this.updateEqWithVelocity(this._eq3, this._eq3Vel, this._eqs.value.z);
        }
        return {
            type: this.rendererId(),
            loudness: this._loudness,
            attributes: this._attributes,
            uniforms: this._uniforms
        };
    };
    EqPointCloud.prototype.rendererId = function () {
        return IDs.eqPointCloud;
    };
    EqPointCloud.prototype.updateEqWithVelocity = function (eq, eqVel, mult) {
        eq.value.add(eqVel.clone().multiplyScalar(mult * mult * 4.0));
        if (eq.value.x > EqPointCloud.CUBE_SIZE * 0.5 || eq.value.x < -EqPointCloud.CUBE_SIZE * 0.5) {
            eqVel.setX(-eqVel.x);
        }
        if (eq.value.y > EqPointCloud.CUBE_SIZE * 0.5 || eq.value.y < -EqPointCloud.CUBE_SIZE * 0.5) {
            eqVel.setY(-eqVel.y);
        }
        if (eq.value.z > EqPointCloud.CUBE_SIZE * 0.5 || eq.value.z < -EqPointCloud.CUBE_SIZE * 0.5) {
            eqVel.setZ(-eqVel.z);
        }
    };
    EqPointCloud.ID = "eqPointCloud";
    EqPointCloud.POINT_COUNT = 80000;
    EqPointCloud.CUBE_SIZE = 64;
    return EqPointCloud;
})(PointCloudVisualization);
var FlockingVisualization = (function (_super) {
    __extends(FlockingVisualization, _super);
    function FlockingVisualization(renderer, audioSource, resolutionProvider, timeSource, shaderLoader, controlsProvider) {
        var _this = this;
        _super.call(this, resolutionProvider, timeSource, shaderLoader, "flocking/point", controlsProvider);
        this._flipflop = true;
        this._renderer = renderer;
        this._scene = new THREE.Scene();
        this._camera = new THREE.Camera();
        this._camera.position.z = 1.0;
        this._resolutionUniform = { name: "resolution", type: "v2", value: new THREE.Vector2(FlockingVisualization.POINT_TEX_WIDTH, FlockingVisualization.POINT_TEX_WIDTH) };
        this._deltaUniform = {
            name: "delta",
            type: "f",
            value: 0.0
        };
        var textureShaderObs = shaderLoader.getShaderFromServer("flocking/texture").map(function (shaderText) {
            var timeUniforms = [
                _this._timeUniform,
                _this._resolutionUniform,
                { name: "texture", type: "t", value: null }
            ];
            return (new ShaderPlane(shaderText, timeUniforms)).mesh;
        }).doOnNext(function (mesh) {
            _this._textureMesh = mesh;
            _this._textureShader = _this._textureMesh.material;
            _this._scene.add(_this._textureMesh);
        });
        var positionShaderObs = shaderLoader.getVariedShaderFromServer("flocking/position", "flocking/texture").map(function (shaderText) {
            var positionUniforms = [
                _this._timeUniform,
                _this._deltaUniform,
                _this._resolutionUniform,
                { name: "texturePosition", type: "t", value: null },
                { name: "textureVelocity", type: "t", value: null }
            ];
            return UniformUtils.createShaderMaterialUniforms(shaderText, positionUniforms);
        }).doOnNext(function (pos) { return _this._positionShader = pos; });
        var velocityShaderObs = shaderLoader.getVariedShaderFromServer("flocking/velocity", "flocking/texture").map(function (shaderText) {
            var velocityUniforms = [
                _this._timeUniform,
                _this._deltaUniform,
                _this._resolutionUniform,
                { name: "texturePosition", type: "t", value: null },
                { name: "textureVelocity", type: "t", value: null },
                { name: "separationDistance", type: "f", value: 4.0 },
                { name: "alignmentDistance", type: "f", value: 4.0 },
                { name: "cohesionDistance", type: "f", value: 4.0 },
                { name: "freedomFactor", type: "f", value: 5.0 }
            ];
            return UniformUtils.createShaderMaterialUniforms(shaderText, velocityUniforms);
        }).doOnNext(function (vel) { return _this._velocityShader = vel; });
        Rx.Observable.zip(textureShaderObs, positionShaderObs, velocityShaderObs, function (tex, pos, vel) {
            return {
                pos: _this.generateTexture(),
                vel: _this.generateVelocityTexture()
            };
        }).subscribe(function (startTex) {
            _this.renderTexture(startTex.pos, _this._rtPosition1);
            _this.renderTexture(_this._rtPosition1, _this._rtPosition2);
            _this.renderTexture(startTex.vel, _this._rtVelocity1);
            _this.renderTexture(_this._rtVelocity1, _this._rtVelocity2);
        });
        this._rtPosition1 = this.getRenderTarget();
        this._rtPosition2 = this._rtPosition1.clone();
        this._rtVelocity1 = this._rtPosition1.clone();
        this._rtVelocity2 = this._rtPosition1.clone();
        this.addUniforms([
            { name: "texturePosition", type: "t", value: null },
            { name: "textureVelocity", type: "t", value: null },
            this._timeUniform,
            this._deltaUniform
        ]);
        this.addAttributes([
            { name: "reference", type: "v2", value: [] },
            { name: "pointVertex", type: "f", value: [] }
        ]);
    }
    FlockingVisualization.prototype.setupVisualizerChain = function () {
        var _this = this;
        this.addDisposable(this._timeSource.observable().subscribe(function (time) {
            _this._deltaUniform.value = time - _this._timeUniform.value;
        }));
        _super.prototype.setupVisualizerChain.call(this);
    };
    FlockingVisualization.prototype.createPointCloudVisualization = function (shaderMaterial) {
        this._pc = this.createPointCloud(FlockingVisualization.POINT_COUNT, shaderMaterial, function (i) { return new THREE.Vector3(Math.random() * 32.0, Math.random() * 32.0, Math.random() * 32.0); });
        var reference = shaderMaterial.attributes.reference.value;
        var pointVertex = shaderMaterial.attributes.pointVertex.value;
        for (var v = 0; v < this._pc.geometry.vertices.length; v++) {
            var i = ~~(v / 3);
            var x = ~(i % FlockingVisualization.POINT_TEX_WIDTH) / FlockingVisualization.POINT_TEX_WIDTH;
            var y = (i % FlockingVisualization.POINT_TEX_WIDTH) / FlockingVisualization.POINT_TEX_WIDTH;
            reference[v] = new THREE.Vector2(x, y);
            pointVertex[v] = v % 9;
        }
        return [this._pc];
    };
    FlockingVisualization.prototype.animate = function () {
        _super.prototype.animate.call(this);
        if (!this._pc) {
            return;
        }
        if (this._flipflop) {
            this.renderVelocity(this._rtPosition1, this._rtVelocity1, this._rtVelocity2);
            this.renderPosition(this._rtPosition1, this._rtVelocity2, this._rtPosition2);
            this._pc.material.uniforms.texturePosition.value = this._rtPosition2;
            this._pc.material.uniforms.textureVelocity.value = this._rtVelocity2;
        }
        else {
            this.renderVelocity(this._rtPosition2, this._rtVelocity2, this._rtVelocity1);
            this.renderPosition(this._rtPosition2, this._rtVelocity1, this._rtPosition1);
            this._pc.material.uniforms.texturePosition.value = this._rtPosition1;
            this._pc.material.uniforms.textureVelocity.value = this._rtVelocity1;
        }
        this._flipflop = !this._flipflop;
    };
    FlockingVisualization.prototype.getRenderTarget = function () {
        return new THREE.WebGLRenderTarget(FlockingVisualization.POINT_TEX_WIDTH, FlockingVisualization.POINT_TEX_WIDTH, {
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.RepeatWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false
        });
    };
    FlockingVisualization.prototype.renderTexture = function (input, output) {
        if (!this._textureMesh) {
            return;
        }
        this._textureMesh.material = this._textureShader;
        this._textureShader.uniforms.texture.value = input;
        this._renderer.render(this._scene, this._camera, output);
    };
    FlockingVisualization.prototype.renderPosition = function (position, velocity, output) {
        if (!this._textureMesh) {
            return;
        }
        this._textureMesh.material = this._positionShader;
        this._positionShader.uniforms.texturePosition.value = position;
        this._positionShader.uniforms.textureVelocity.value = velocity;
        this._renderer.render(this._scene, this._camera, output);
    };
    FlockingVisualization.prototype.renderVelocity = function (position, velocity, output) {
        if (!this._textureMesh) {
            return;
        }
        this._textureMesh.material = this._velocityShader;
        this._velocityShader.uniforms.texturePosition.value = position;
        this._velocityShader.uniforms.textureVelocity.value = velocity;
        this._renderer.render(this._scene, this._camera, output);
    };
    FlockingVisualization.prototype.generateTexture = function () {
        return this.generateDataTexture(function () { return Math.random() * FlockingVisualization.CUBE_SIZE - FlockingVisualization.CUBE_SIZE * 0.5; });
    };
    FlockingVisualization.prototype.generateVelocityTexture = function () {
        return this.generateDataTexture(function () { return Math.random() - 0.5; });
    };
    FlockingVisualization.prototype.generateDataTexture = function (positionFunc) {
        var w = FlockingVisualization.POINT_TEX_WIDTH, h = FlockingVisualization.POINT_TEX_WIDTH;
        var a = new Float32Array(FlockingVisualization.POINT_COUNT * 4);
        var x, y, z;
        for (var k = 0; k < FlockingVisualization.POINT_COUNT; k++) {
            x = positionFunc();
            y = positionFunc();
            z = positionFunc();
            a[k * 4 + 0] = x;
            a[k * 4 + 1] = y;
            a[k * 4 + 2] = z;
            a[k * 4 + 3] = 1;
        }
        var texture = new THREE.DataTexture(a, FlockingVisualization.POINT_TEX_WIDTH, FlockingVisualization.POINT_TEX_WIDTH, THREE.RGBAFormat, THREE.FloatType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter, 1);
        texture.flipY = true;
        texture.needsUpdate = true;
        return texture;
    };
    FlockingVisualization.ID = "flocking";
    FlockingVisualization.POINT_TEX_WIDTH = 256;
    FlockingVisualization.POINT_COUNT = FlockingVisualization.POINT_TEX_WIDTH * FlockingVisualization.POINT_TEX_WIDTH;
    FlockingVisualization.CUBE_SIZE = 32;
    return FlockingVisualization;
})(PointCloudVisualization);
/// <reference path="./BaseVisualization"/>
/// <reference path="./SimpleVisualization"/>
/// <reference path="./DotsVisualization"/>
/// <reference path="./CirclesVisualization"/>
/// <reference path="./VideoDistortionVisualization"/>
/// <reference path="./VideoAudioSpiralVisualization"/>
/// <reference path="./SquareVisualization"/>
/// <reference path="./EqPointCloud"/>
/// <reference path="./FlockingVisualization"/>
var VisualizationManager = (function () {
    function VisualizationManager(renderer, videoSource, audioSource, resolutionProvider, shaderBaseUrl, controlsProvider) {
        this._visualizationSubject = new Rx.BehaviorSubject(null);
        this._visualizations = [];
        this._renderer = renderer;
        this._shaderLoader = new ShaderLoader("util.frag", shaderBaseUrl);
        this._audioSource = audioSource;
        this._videoSource = videoSource;
        this._timeSource = new TimeSource();
        this._resolutionProvider = resolutionProvider;
        this._controlsProvider = controlsProvider;
    }
    VisualizationManager.prototype.meshObservable = function (optionObservable) {
        var _this = this;
        optionObservable.subscribe(function (__) {
            if (_this._visualizationSubject.getValue() != null) {
                _this._visualizationSubject.getValue().unsubscribe();
            }
        });
        this.addVisualization(optionObservable, SimpleVisualization.ID, function (options) { return new SimpleVisualization(_this._audioSource, _this._resolutionProvider, _this._timeSource, options, _this._shaderLoader, _this._controlsProvider); });
        this.addVisualization(optionObservable, IDs.dots, function (options) { return new DotsVisualization(_this._audioSource, _this._resolutionProvider, _this._timeSource, _this._shaderLoader, _this._controlsProvider); });
        this.addVisualization(optionObservable, IDs.circles, function (options) { return new CirclesVisualization(_this._audioSource, _this._resolutionProvider, _this._timeSource, _this._shaderLoader, _this._controlsProvider); });
        this.addVisualization(optionObservable, VideoDistortionVisualization.ID, function (options) { return new VideoDistortionVisualization(_this._videoSource, _this._audioSource, _this._resolutionProvider, _this._timeSource, _this._shaderLoader, _this._controlsProvider); });
        this.addVisualization(optionObservable, VideoAudioSpiralVisualization.ID, function (options) { return new VideoAudioSpiralVisualization(_this._videoSource, _this._audioSource, _this._resolutionProvider, _this._timeSource, _this._shaderLoader, _this._controlsProvider); });
        this.addVisualization(optionObservable, SquareVisualization.ID, function (options) { return new SquareVisualization(_this._audioSource, _this._resolutionProvider, _this._timeSource, _this._shaderLoader, _this._controlsProvider); });
        this.addVisualization(optionObservable, EqPointCloud.ID, function (options) { return new EqPointCloud(_this._audioSource, _this._resolutionProvider, _this._timeSource, _this._shaderLoader, _this._controlsProvider); });
        this.addVisualization(optionObservable, FlockingVisualization.ID, function (options) { return new FlockingVisualization(_this._renderer, _this._audioSource, _this._resolutionProvider, _this._timeSource, _this._shaderLoader, _this._controlsProvider); });
        return this._visualizationSubject.asObservable().filter(function (vis) { return vis != null; }).flatMap(function (visualization) { return visualization.object3DObservable(); });
    };
    VisualizationManager.prototype.observableSubject = function () {
        return this._visualizationSubject.asObservable().flatMap(function (vis) { return vis.object3DObservable().map(function (newVis) {
            return { type: vis.rendererId(), objects: newVis };
        }); });
    };
    VisualizationManager.prototype.addVisualization = function (optionObservable, id, f) {
        var _this = this;
        optionObservable.filter(function (visualization) { return visualization.id == id; }).map(function (visOpt) {
            if (!_this._visualizations[visOpt.id]) {
                _this._visualizations[visOpt.id] = f(visOpt.options);
            }
            return _this._visualizations[visOpt.id];
        }).map(function (visualizationOption) { return visualizationOption.options; }).map(function (options) { return f.call(_this, options); }).subscribe(this._visualizationSubject);
    };
    VisualizationManager.prototype.animate = function () {
        return this._visualizationSubject.getValue().animate();
    };
    return VisualizationManager;
})();
/// <reference path='../typed/three.d.ts'/>
/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/rx-lite.d.ts"/>
/// <reference path="../typed/rx.binding-lite.d.ts"/>
/// <reference path="../Models/Sources/UniformProvider"/>
/// <reference path='../Models/ShaderLoader.ts'/>
/// <reference path='../Models/Sources/ResolutionProvider.ts'/>
/// <reference path="../Models/Sources/TimeSource"/>
/// <reference path='../Models/LoudnessAccumulator.ts'/>
/// <reference path="../Models/Visualizations/VisualizationManager"/>
var GLController = (function () {
    function GLController(visualizationOptionObservable, resolutionProvider) {
        this._meshSubject = new Rx.BehaviorSubject([]);
        this.MeshObservable = this._meshSubject.asObservable();
        this._resolutionProvider = resolutionProvider;
        this._visOptionObservable = visualizationOptionObservable;
    }
    GLController.prototype.setVisualizationManager = function (visMan) {
        var _this = this;
        this._visualizationManager = visMan;
        this._visualizationManager.meshObservable(this._visOptionObservable).subscribe(function (meshes) {
            _this._meshSubject.onNext(meshes);
        });
    };
    GLController.prototype.onNewResolution = function (resolution) {
        this._resolutionProvider.updateResolution(new THREE.Vector2(resolution.width, resolution.height));
    };
    return GLController;
})();
/// <reference path='../Control.ts'/>
var ControlsProvider = (function () {
    function ControlsProvider() {
        this._controls = {};
        this._controlUniforms = [];
        this._controlSubject = new Rx.BehaviorSubject([]);
    }
    ControlsProvider.prototype.uniforms = function () {
        return this._controlUniforms;
    };
    ControlsProvider.prototype.updateControl = function (name, value) {
        this._controls[name].value = value;
    };
    ControlsProvider.prototype.controlsObservable = function () {
        return this._controlSubject.asObservable();
    };
    ControlsProvider.prototype.getValue = function (name) {
        return this._controls[name].value;
    };
    ControlsProvider.prototype.newControls = function (controls) {
        var _this = this;
        var oldControls = this._controls;
        this._controls = {};
        this._controlUniforms = [];
        controls.forEach(function (control) {
            if (oldControls[control.name]) {
                _this._controls[control.name] = oldControls[control.name];
            }
            else {
                _this._controls[control.name] = {
                    name: control.name,
                    type: "f",
                    value: control.defVal
                };
            }
            _this._controlUniforms.push(_this._controls[control.name]);
        });
        this._controlSubject.onNext(controls);
    };
    return ControlsProvider;
})();
/// <reference path='../Models/Sources/ControlsProvider.ts'/>
var ControlsController = (function () {
    function ControlsController(controlsProvider) {
        this._controlsProvider = controlsProvider;
    }
    ControlsController.prototype.controlsObservable = function () {
        return this._controlsProvider.controlsObservable();
    };
    ControlsController.prototype.onControlChange = function (name, value) {
        this._controlsProvider.updateControl(name, value);
    };
    return ControlsController;
})();
var ControlsView = (function () {
    function ControlsView(controller) {
        var _this = this;
        this._container = $("<div>", { class: "controls shader-controls" });
        this._controlsController = controller;
        this._controlsController.controlsObservable().subscribe(function (controls) {
            _this._container.empty();
            controls.forEach(function (control) { return _this.renderControl(control); });
        });
    }
    ControlsView.prototype.render = function (el) {
        $(el).append(this._container);
    };
    ControlsView.prototype.renderControl = function (control) {
        var _this = this;
        var controlContainer = $("<div>");
        controlContainer.append(control.name + ": ");
        var controlSlider = $("<input>", { type: "range", min: control.min, max: control.max, step: 0.0000001 });
        controlSlider.on('input', function (__) {
            _this._controlsController.onControlChange(control.name, controlSlider.val());
        });
        controlContainer.append(controlSlider);
        this._container.append(controlContainer);
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
    function VisualizationOptionsView(shadersController, autoplay) {
        this._shadersController = shadersController;
        this._autoplay = autoplay;
    }
    VisualizationOptionsView.prototype.render = function (el) {
        var _this = this;
        var container = $("<div>", { class: "shaders" });
        // Select for all of the shaders
        var select = $("<select />");
        select.change(function (__) { return _this._shadersController.onOptionName(select.find('option:selected').val()); });
        this._shadersController.shaderNames().forEach(function (shaderName) { return select.append("<option value=\"" + shaderName + "\">" + shaderName + "</option>"); });
        container.append(select);
        if (this._autoplay) {
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
        }
        else {
            this._shadersController.onAutoplayChanged(false);
        }
        $(el).append(container);
    };
    return VisualizationOptionsView;
})();
var Microphone = (function () {
    function Microphone() {
        this._created = false;
        this.nodeSubject = new Rx.Subject();
    }
    Microphone.prototype.isCreatingOrCreated = function () {
        return this._created || this._creating;
    };
    Microphone.prototype.onContext = function (audioContext) {
        var _this = this;
        if (this._created) {
            this.nodeSubject.onNext(this.node);
            return;
        }
        if (this._creating) {
            return;
        }
        this._creating = true;
        var gotStream = function (stream) {
            _this._created = true;
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
            this._creating = false;
            return (alert("Error: getUserMedia not supported!"));
        }
    };
    Microphone.prototype.nodeObservable = function () {
        return this.nodeSubject;
    };
    return Microphone;
})();
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
/// <reference path="./Source"/>
/// <reference path="../AudioAnalyser"/>
var AudioSource = (function () {
    function AudioSource(audioContext) {
        this._audioContext = audioContext;
        this._audioAnalyser = new AudioAnalyser(this._audioContext, AudioSource.FFT_SIZE);
        this._audioEventSubject = new Rx.Subject();
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
    AudioSource.prototype.observable = function () {
        return this._audioEventSubject.asObservable();
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
/// <reference path="../Microphone"/>
/// <reference path="./AudioSource"/>
var MicSource = (function (_super) {
    __extends(MicSource, _super);
    function MicSource(audioContext) {
        var _this = this;
        _super.call(this, audioContext);
        this._microphone = new Microphone();
        this._microphone.nodeObservable().subscribe(function (node) { return _this.updateSourceNode(node); });
    }
    MicSource.prototype.animate = function () {
        if (!this._microphone.isCreatingOrCreated()) {
            this._microphone.onContext(this._audioContext);
        }
        _super.prototype.animate.call(this);
    };
    return MicSource;
})(AudioSource);
/// <reference path="./GLView.ts"/>
/// <reference path="../Controllers/GLController.ts"/>
/// <reference path="../Controllers/ControlsController.ts"/>
/// <reference path="./ControlsView.ts"/>
/// <reference path='./IControllerView.ts' />
/// <reference path="./VisualizationOptionsView.ts"/>
/// <reference path="../Controllers/VisualizationOptionsController.ts"/>
/// <reference path="../Models/VisualizationOption"/>
/// <reference path="../Models/Sources/MicSource"/>
/// <reference path="../Models/Sources/AudioSource"/>
/// <reference path="../Models/Window"/>
var GLVis;
(function (GLVis) {
    var MicInput = (function () {
        function MicInput(visualizationOptions, shadersUrl) {
            var _this = this;
            this.content = $("<div>");
            window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
            var audioSource = new MicSource(new AudioContext());
            var videoSource = new VideoSource();
            var resolutionProvider = new ResolutionProvider();
            var controlsProvider = new ControlsProvider();
            this._visualizationOptionsController = new VisualizationOptionsController(visualizationOptions);
            this._controlsController = new ControlsController(controlsProvider);
            this._glController = new GLController(this._visualizationOptionsController.VisualizationOptionObservable, resolutionProvider);
            this._glView = new GLView(this._glController);
            this._shadersView = new VisualizationOptionsView(this._visualizationOptionsController, false);
            this._controlsView = new ControlsView(this._controlsController);
            this._visualizationManager = new VisualizationManager(this._glView.renderer(), videoSource, audioSource, resolutionProvider, shadersUrl, controlsProvider);
            this._glController.setVisualizationManager(this._visualizationManager);
            window.addEventListener('keypress', function (e) {
                // console.log(e.keyCode);
                // 'f' key
                if (e.keyCode == 102) {
                    _this._otherWindow = window.open("window.html", "_new", undefined, true);
                    _this._otherWindow.onload = function () {
                        _this._visualizationManager.observableSubject().subscribe(function (objs) { return _this._otherWindow.newVis(objs); });
                    };
                }
            });
        }
        MicInput.prototype.render = function (el) {
            var _this = this;
            this._glView.render(this.content[0]);
            this._shadersView.render(this.content[0]);
            this._controlsView.render(this.content[0]);
            // this._videoView.render(this.content[0]);
            $(el).append(this.content);
            requestAnimationFrame(function () { return _this.animate(); });
        };
        MicInput.prototype.animate = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this.animate(); });
            var update = this._visualizationManager.animate();
            if (this._otherWindow) {
                this._otherWindow.update(update);
            }
            if (!this._otherWindow) {
                this._glView.animate();
            }
        };
        return MicInput;
    })();
    GLVis.MicInput = MicInput;
})(GLVis || (GLVis = {}));
