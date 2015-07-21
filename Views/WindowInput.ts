/// <reference path="../Models/Visualizations/IDs"/>
/// <reference path="../Models/Visualizations/VisualizationRenderer"/>
/// <reference path="../Models/Visualizations/ObjectRenderer"/>
/// <reference path="../Models/Visualizations/EqPointCloudRenderer"/>
/// <reference path="../Models/Visualizations/GPGPUPointCloudRenderer"/>
/// <reference path="../Models/Visualizations/VideoDistortionRenderer"/>
/// <reference path="../Models/Visualizations/LSystemRenderer.ts"/>
/// <reference path="../typed/three.d.ts"/>
/// <reference path="../Models/Window"/>
/// <reference path="../typed/rx.d.ts"/>

module GLVis {
  export class WindowInput {
    private _canvas: HTMLCanvasElement;

    private _renderer: THREE.WebGLRenderer;
    private _camera: THREE.Camera;
    private _scene: THREE.Scene;

    private _sceneContainer: THREE.Object3D;

    private _visRenderer: VisualizationRenderer;

    private _resolution: THREE.Vector2;

    constructor() {
      this._canvas = document.createElement('canvas');

      this.onWindowResize();
      window.addEventListener("resize", (__) => this.onWindowResize(), false);

      window.newVis = (vis) => this.newVis(vis);
      window.update = (updateData) => this.update(updateData);
    }

    render(el: HTMLElement): void {
      this._camera  = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 350 );
      this._camera.position.z = 100;

      this._scene = new THREE.Scene()
      this._renderer = new THREE.WebGLRenderer();

      el.appendChild(this._renderer.domElement);

      this.onWindowResize();

      window.addEventListener("resize", (__) => this.onWindowResize(), false);

      requestAnimationFrame(() => this.animate());
    }

    update(data:any): void {
      if(this._visRenderer) {
        this._visRenderer.update(data, this._resolution);
      }
    }

    onWindowResize() {
      if(this._renderer) {
        this._renderer.setSize(window.innerWidth, window.innerHeight);
      }
      this._resolution = new THREE.Vector2(window.innerWidth, window.innerHeight)
    }

    newVis(data: any) {
      var meshes = data.objects;
      var loader = new THREE.ObjectLoader();
      var obj = new THREE.Object3D();
      obj.position = new THREE.Vector3(0, 0, 0);

      if (data.type == IDs.shader) {
        meshes.forEach((mesh) => {
          var newMesh = loader.parse(mesh.toJSON());
          obj.add(newMesh);
        });

        this._visRenderer = new ObjectRenderer(<THREE.Mesh>obj.children[0]);
      }
      else if(data.type == IDs.videoDistortion) {
        meshes.forEach((mesh) => {
          var newMesh = loader.parse(mesh.toJSON());
          obj.add(newMesh);
        });

        this._visRenderer = new VideoDistortionRenderer(<THREE.Mesh>obj.children[0]);
      }
      else if(data.type == IDs.pointCloud || data.type == IDs.eqPointCloud ||
        data.type == IDs.gpgpuPointCloud) {
        var pc = new THREE.PointCloud(meshes[0].geometry, meshes[0].material);

        obj.add(pc);
        if(data.type == IDs.eqPointCloud) {
          this._visRenderer = new EqPointCloudRenderer(pc);
        }
        else if(data.type == IDs.gpgpuPointCloud) {
          this._visRenderer = new GPGPUPointCloudRenderer(pc);
        }
        else {
          this._visRenderer =  new ObjectRenderer(pc);
        }
      }
      else if(data.type == IDs.lsystem) {
        /*console.log(meshes[0]);*/
        var parsedLines = <THREE.Line>loader.parse(meshes[0].toJSON());
        /*obj.add(line);*/
        var lines = new THREE.Line(parsedLines.geometry, new THREE.LineBasicMaterial({
          vertexColors: THREE.VertexColors,
          linewidth: 5.0
          }), THREE.LinePieces);

        obj.add(lines);
        this._visRenderer = new LSystemRenderer(lines);
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
