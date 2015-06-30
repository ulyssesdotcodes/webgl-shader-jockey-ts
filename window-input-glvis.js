var IDs = (function () {
    function IDs() {
    }
    IDs.dots = "dots";
    IDs.circles = "circles";
    return IDs;
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
/// <reference path="./VisualizationRenderer"/>
/// <reference path="../Sources/AudioSource"/>
var ShaderRenderer = (function () {
    function ShaderRenderer(plane) {
        this._plane = plane;
        this._buffers = {};
        for (var name in this._plane.material.uniforms) {
            var uniform = this._plane.material.uniforms[name];
            if (uniform.type == "t") {
                this._buffers[uniform.name] = new Uint8Array(AudioSource.FFT_SIZE * 4);
                var dataTexture = new THREE.DataTexture(this._buffers[uniform.name], AudioSource.FFT_SIZE, 1, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearMipMapLinearFilter, 1);
                this._plane.material.uniforms[uniform.name] = {
                    name: uniform.name,
                    type: "t",
                    value: dataTexture
                };
                this.copyBuffer(uniform.value.image.data, this._buffers[uniform.name]);
                this._plane.material.uniforms[uniform.name].value.needsUpdate = true;
            }
        }
    }
    ShaderRenderer.prototype.update = function (update) {
        var _this = this;
        update.uniforms.forEach(function (uniform) {
            if (uniform.type == "t") {
                _this.copyBuffer(uniform.value.image.data, _this._buffers[uniform.name]);
                _this._plane.material.uniforms[uniform.name].value.needsUpdate = true;
            }
            else {
                var newUniform = {
                    type: uniform.type,
                    name: uniform.name,
                    value: uniform.value
                };
                _this._plane.material.uniforms[uniform.name] = newUniform;
            }
        });
    };
    ShaderRenderer.prototype.copyBuffer = function (source, dest) {
        for (var i = 0; i < source.length; i++) {
            dest[i] = source[i];
        }
    };
    return ShaderRenderer;
})();
/// <reference path="../Models/Visualizations/IDs"/>
/// <reference path="../Models/Visualizations/VisualizationRenderer"/>
/// <reference path="../Models/Visualizations/ShaderRenderer"/>
/// <reference path="../typed/three.d.ts"/>
/// <reference path="../Models/Window"/>
/// <reference path="../typed/rx.d.ts"/>
var GLVis;
(function (GLVis) {
    var WindowInput = (function () {
        function WindowInput() {
            var _this = this;
            this._canvas = document.createElement('canvas');
            this._context = this._canvas.getContext('2d');
            this.onWindowResize();
            window.addEventListener("resize", function (__) { return _this.onWindowResize(); }, false);
            window.newVis = function (vis) { return _this.newVis(vis); };
            window.update = function (update) { return _this.update(update); };
        }
        WindowInput.prototype.render = function (el) {
            var _this = this;
            this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 350);
            this._camera.position.z = 2;
            this._scene = new THREE.Scene();
            this._renderer = new THREE.WebGLRenderer();
            el.appendChild(this._renderer.domElement);
            this.onWindowResize();
            window.addEventListener("resize", function (__) { return _this.onWindowResize(); }, false);
            requestAnimationFrame(function () { return _this.animate(); });
        };
        WindowInput.prototype.update = function (data) {
            if (this._visRenderer) {
                this._visRenderer.update(data);
            }
        };
        WindowInput.prototype.onWindowResize = function () {
            if (this._renderer) {
                this._renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };
        WindowInput.prototype.newVis = function (data) {
            var meshes = data.objects;
            var loader = new THREE.ObjectLoader();
            var obj = new THREE.Object3D();
            meshes.forEach(function (mesh) {
                var newMesh = loader.parse(mesh);
                obj.add(newMesh);
            });
            obj.position = new THREE.Vector3(0, 0, 0);
            if (data.type == IDs.dots || data.type == IDs.circles) {
                this._visRenderer = new ShaderRenderer(obj.children[0]);
            }
            else {
                console.log("Couldn't find renderer type " + data.type);
            }
            if (this._sceneContainer) {
                this._scene.remove(this._sceneContainer);
            }
            this._sceneContainer = obj;
            this._scene.add(this._sceneContainer);
        };
        WindowInput.prototype.animate = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this.animate(); });
            if (this._scene) {
                this._renderer.render(this._scene, this._camera);
            }
        };
        return WindowInput;
    })();
    GLVis.WindowInput = WindowInput;
})(GLVis || (GLVis = {}));
