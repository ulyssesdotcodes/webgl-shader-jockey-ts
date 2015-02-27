class GLView {
  private _glController: GLController;
  private _currentPlaneMesh: THREE.Mesh;
  private _renderer: THREE.WebGLRenderer;
  private _windowDimensPropertyProvider: ConstPropertiesProvider;
  private _camera: THREE.Camera;
  private _scene: THREE.Scene;

  constructor(audioManager: AudioManager) {
    this._glController = new GLController(audioManager);
  }

  render(el: HTMLElement): void {
    this._camera = new THREE.Camera();
    this._scene = new THREE.Scene();
    this._renderer = new THREE.WebGLRenderer();

    this._camera.position.z = 1;
    this._renderer.setPixelRatio(window.devicePixelRatio);

    var sceneContainer = new THREE.Object3D();
    this._scene.add(sceneContainer);
    this._glController.MeshObservable
      .scan(new THREE.Object3D(),
      (obj, meshes) => {
        obj = new THREE.Object3D()
        for (var mesh in meshes) {
          obj.add(mesh);
        }
        return obj;
      })
      .subscribe((obj) => {
      this._scene.add(sceneContainer);
    });

    el.appendChild(this._renderer.domElement);

    this.onWindowResize();

    window.addEventListener('resize',(__) => this.onWindowResize(), false);
  }

  onWindowResize() {
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this._renderer.render(this._scene, this._camera);
  }
}