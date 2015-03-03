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
            for (var mesh in meshes) {
                obj.add(mesh);
            }
            return obj;
        }).subscribe(function (obj) {
            _this._scene.add(sceneContainer);
        });
        el.appendChild(this._renderer.domElement);
        this.onWindowResize();
        window.addEventListener('resize', function (__) { return _this.onWindowResize(); }, false);
    };
    GLView.prototype.onWindowResize = function () {
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    };
    GLView.prototype.animate = function () {
        this._renderer.render(this._scene, this._camera);
    };
    return GLView;
})();
