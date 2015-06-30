/// <reference path="../Models/Visualizations/IDs"/>
/// <reference path="../Models/Visualizations/VisualizationRenderer"/>
/// <reference path="../Models/Visualizations/ShaderRenderer"/>
/// <reference path="../typed/three.d.ts"/>
/// <reference path="../Models/Window"/>
/// <reference path="../typed/rx.d.ts"/>

module GLVis {
  export class WindowInput {
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    private _renderer: THREE.WebGLRenderer;
    private _camera: THREE.Camera;
    private _scene: THREE.Scene;

    private _sceneContainer: THREE.Object3D;

    private _visRenderer: VisualizationRenderer;

    constructor() {
      this._canvas = document.createElement('canvas');
      this._context = this._canvas.getContext('2d');

      this.onWindowResize();
      window.addEventListener("resize", (__) => this.onWindowResize(), false);

      window.newVis = (vis) => this.newVis(vis);
      window.update = (update) => this.update(update);
    }

    render(el: HTMLElement): void {
      this._camera  = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 350 );
      this._camera.position.z = 2;

      this._scene = new THREE.Scene()
      this._renderer = new THREE.WebGLRenderer();

      el.appendChild(this._renderer.domElement);

      this.onWindowResize();

      window.addEventListener("resize", (__) => this.onWindowResize(), false);

      requestAnimationFrame(() => this.animate());
    }

    update(data:any): void {
      if(this._visRenderer) {
        this._visRenderer.update(data);
      }
    }

    onWindowResize() {
      if(this._renderer) {
        this._renderer.setSize(window.innerWidth, window.innerHeight);
      }
    }

    newVis(data: any) {
      var meshes = data.objects;
      var loader = new THREE.ObjectLoader();
      var obj = new THREE.Object3D();
      meshes.forEach((mesh) => {
        var newMesh = loader.parse(mesh);
        obj.add(newMesh);
      });

      obj.position = new THREE.Vector3(0, 0, 0);

      if (data.type == IDs.dots || data.type == IDs.circles) {
        this._visRenderer = new ShaderRenderer(<THREE.Mesh>obj.children[0]);
      }
      else {
        console.log("Couldn't find renderer type " + data.type);
      }

      if(this._sceneContainer) {
        this._scene.remove(this._sceneContainer);
      }
      this._sceneContainer = obj;
      this._scene.add(this._sceneContainer);
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      if(this._scene) {
        this._renderer.render(this._scene, this._camera);
      }
    }
  }
}
