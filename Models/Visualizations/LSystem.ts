class LSystem extends BaseVisualization {
  static ID = "lsystem";

  private _delta = 20;

  private _gen: string = "F+F+F+F+F"
  private _genIndex: number = 1.0;

  private _vertexPositions: Float32Array;
  private _colors: Float32Array;
  private _vertices: Array<Array<number>> = [];

  private _timeSource: TimeSource;
  private _time = 0.0;
  private _lastDraw = 0.0;

  private _geometry: THREE.BufferGeometry;

  constructor(timeSource: TimeSource) {
    super();

    this._timeSource = timeSource;

    this.addSources([this._timeSource]);
  }

  protected setupVisualizerChain(): void {
    this.addDisposable(this._timeSource.observable().subscribe((time) => {
      this._time = time;
    }));
  }

  object3DObservable(): Rx.Observable<Array<THREE.Object3D>> {
    return Rx.Observable.create<Array<THREE.Object3D>>((observer) => {
        this.setupVisualizerChain();

        var mat = new THREE.LineBasicMaterial({
          vertexColors: THREE.VertexColors
        });

        this._geometry = new THREE.BufferGeometry();
        this._vertexPositions = new Float32Array(500 * 3);
        this._colors = new Float32Array(500 * 3);

        this._vertices[0] = [0, 0, 0, 0];

        this._geometry.addAttribute('position', new THREE.BufferAttribute(this._vertexPositions, 3));
        this._geometry.addAttribute('color', new THREE.BufferAttribute(this._colors, 3));

        /*this.addVertex("F");*/

        var lines = new THREE.Line(this._geometry, mat);

        this._geometry.computeBoundingSphere();

        this.onCreated();

        observer.onNext([lines]);
      });
  }

  private addVertex(rule: string) {
    var currentVert = this._vertices[this._vertices.length - 1];
    var addedVertices = 0;
    switch (rule) {
      case 'F':
        if(this._vertices.length > 1) {
          this._vertices.push(currentVert);
        }
        this._vertices.push([
          currentVert[0] + Math.cos(currentVert[3] / 180) * 8,
          currentVert[1] + Math.sin(currentVert[3] / 100) * 8,
          currentVert[2], currentVert[3]
        ]);
        addedVertices += 2;
        break;
      case '+':
        currentVert[3] += this._delta;
        break;
    }

    for(var i = 0; i < addedVertices; i++) {
      var j = this._vertices.length - addedVertices + i;
      this._vertexPositions[j * 3] = this._vertices[j][0];
      this._vertexPositions[j * 3 + 1] = this._vertices[j][1];
      this._vertexPositions[j * 3 + 2] = this._vertices[j][2];

      this._colors[j * 3] = 0;
      this._colors[j * 3 + 1] = 0;
      this._colors[j * 3 + 2] = 1;
    }

    if(addedVertices > 0) {
      (<any>this._geometry.attributes).position.needsUpdate = true;
      (<any>this._geometry.attributes).color.needsUpdate = true;
      this._geometry.computeBoundingSphere();
    }
  }

  animate() {
    super.animate();

    if(this._time - this._lastDraw > 1.0) {
      this._lastDraw = this._time;

      this.addVertex(this._gen.charAt(this._genIndex));
        this._geometry.computeBoundingSphere();
      this._genIndex += 1.0;
    }
  }



}
