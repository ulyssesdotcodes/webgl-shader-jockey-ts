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

class GLController {
  private _meshSubject: Rx.BehaviorSubject<Array<THREE.Object3D>>;
  MeshObservable: Rx.Observable<Array<THREE.Object3D>>;
  private _resolutionProvider: ResolutionProvider;
  private _shadersUrl: string;

  private _visualizationManager: VisualizationManager;

  constructor(visualizationManager: VisualizationManager, visualizationOptionObservable: Rx.Observable<VisualizationOption>, resolutionProvider: ResolutionProvider) {
    this._meshSubject = new Rx.BehaviorSubject<Array<THREE.Object3D>>([]);
    this.MeshObservable = this._meshSubject.asObservable();

    this._resolutionProvider = resolutionProvider;
    this._visualizationManager = visualizationManager;
    this._visualizationManager.meshObservable(visualizationOptionObservable)
      .subscribe((meshes) => {
        this._meshSubject.onNext(meshes);
      })
  }

  onNewResolution(resolution) {
    this._resolutionProvider.updateResolution(
      new THREE.Vector2(resolution.width, resolution.height));
  }
}
