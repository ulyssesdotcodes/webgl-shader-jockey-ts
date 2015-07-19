/// <reference path="../TypedArrayAttribute.ts"/>

class LSystem extends BaseVisualization {
  static ID = "lsystem";

  private _da = 22.5;
  private _length = 2;
  private _ru: Array<THREE.Matrix4> = [];
  private _rl: Array<THREE.Matrix4> = [];
  private _rh: Array<THREE.Matrix4> = [];

  private _genIndex: number = 0.0;
  private _rules: any;

  private _genStack: Array<any>;

  private _vertexStack = [];

  private _vertexPositions: Float32Array;
  private _colors: Float32Array;
  private _vertices: Array<Array<number>> = [];
  private _line: THREE.Line;

  private _timeSource: TimeSource;
  private _time = 0.0;
  private _dt = 0.0;

  private _audioSource: AudioSource;
  private _growth = 0.0;
  private _color = new THREE.Vector3(0.0, 0.0, 1.0);

  private _geometry: THREE.BufferGeometry;

  private _attributes: Array<TypedArrayAttribute> = [];

  constructor(timeSource: TimeSource, audioSource: AudioSource) {
    super();

    this._timeSource = timeSource;
    this._audioSource = audioSource;

    this.addSources([this._timeSource, this._audioSource]);

    this._ru[0] = new THREE.Matrix4();
    this._ru[0].makeRotationZ(-this._da);
    this._ru[1] = new THREE.Matrix4();
    this._ru[1].makeRotationZ(this._da);
    this._rl[0] = new THREE.Matrix4();
    this._rl[0].makeRotationY(-this._da);
    this._rl[1] = new THREE.Matrix4();
    this._rl[1].makeRotationY(this._da);
    this._rh[0] = new THREE.Matrix4();
    this._rh[0].makeRotationX(-this._da);
    this._rh[1] = new THREE.Matrix4();
    this._rh[1].makeRotationX(this._da);

    this._rules = {
      "F": [
        "F[+F]F[-F]F",
        "[+F][-F]",
        "F[-F]F",
        "F[+F]F",
        "F[+F]F[-F]F",
        "[+F][-F]",
        "F[-F]F",
        "F[+F]F",
        "F[&F[+F]F]F",
        "F[&F[-F]F]F",
        "F[^F[+F]F]F",
        "F[^F[-F]F]F",
      ]
    }

    this._geometry = new THREE.BufferGeometry();

    this._vertexPositions = new Float32Array(5000 * 3);
    this._colors = new Float32Array(5000 * 3);

    this._attributes.push({
      name: 'position',
      type: 'v3',
      value: this._vertexPositions,
      itemSize: 3
    });

    this._attributes.push({
      name: 'color',
      type: 'c',
      value: this._colors,
      itemSize: 3
    });

    this._geometry.addAttribute('position', new THREE.BufferAttribute(this._vertexPositions, 3));
    this._geometry.addAttribute('color', new THREE.BufferAttribute(this._colors, 3));

    var mat = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors
    });

    this._line = new THREE.Line(this._geometry, mat, THREE.LinePieces);

    this.addSources([this._timeSource, this._audioSource]);

    this._ru[0] = new THREE.Matrix4();
    this._ru[0].makeRotationZ(-this._da);
    this._ru[1] = new THREE.Matrix4();
    this._ru[1].makeRotationZ(this._da);
    this._rl[0] = new THREE.Matrix4();
    this._rl[0].makeRotationY(-this._da);
    this._rl[1] = new THREE.Matrix4();
    this._rl[1].makeRotationY(this._da);
    this._rh[0] = new THREE.Matrix4();
    this._rh[0].makeRotationX(-this._da);
    this._rh[1] = new THREE.Matrix4();
    this._rh[1].makeRotationX(this._da);

    this._rules = {
      "F": [
        "F[+F]F[-F]F",
        "[+F][-F]",
        "F[-F]F",
        "F[+F]F",
        "F[+F]F[-F]F",
        "[+F][-F]",
        "F[-F]F",
        "F[+F]F",
        "F[&F[+F]F]F",
        "F[&F[-F]F]F",
        "F[^F[+F]F]F",
        "F[^F[-F]F]F",
      ]
    };
  }

  protected setupVisualizerChain(): void {
    this.addDisposable(this._timeSource.observable().subscribe((time) => {
      if(time != this._time) {
        this._dt = time - this._time;
      }
      this._time = time;
    }));

    this.addDisposable(this._audioSource.observable()
      .map((e) => AudioUniformFunctions.calculateLoudness(e))
      .subscribe((loudness) => {
        this._growth = Math.pow(loudness, 0.5) * 5.0;
    }) );

    this.addDisposable(this._audioSource.observable()
      .map((e) => AudioUniformFunctions.calculateEqs(e, 3))
      .subscribe((eqs) => {
        this._color.x = Math.pow(eqs[0], 1.5);
        this._color.y = eqs[1];
        this._color.z = Math.pow(eqs[2], 0.7);
    }) );
  }

  object3DObservable(): Rx.Observable<Array<THREE.Object3D>> {
    return Rx.Observable.create<Array<THREE.Object3D>>((observer) => {
      this.setupVisualizerChain();

      this.onCreated();

      this.resetGen();

      observer.onNext([this._line]);
    });
  }

  private addVertex(rule: string, gen): boolean {
    var addedVertices = 0;
    switch (rule) {
      case 'F':
        this._vertices.push(gen.currentVertex.slice(0));
        gen.currentVertex = [
          gen.currentVertex[0] + gen.heading.getComponent(0) * this._length,
          gen.currentVertex[1] + gen.heading.getComponent(1) * this._length,
          gen.currentVertex[2] + gen.heading.getComponent(2) * this._length
        ];
        this._vertices.push(gen.currentVertex.slice(0));
        addedVertices += 2;
        break;
      case '+':
        gen.heading.transformDirection(this._ru[0]).multiplyScalar(-1.0);
        break;
      case '-':
        gen.heading.transformDirection(this._ru[1]).multiplyScalar(-1.0);
        break;
      case '&':
        gen.heading.transformDirection(this._rl[0]).multiplyScalar(-1.0);
        break;
      case '^':
        gen.heading.transformDirection(this._rl[1]).multiplyScalar(-1.0);
        break;
      case '\\':
        gen.heading.transformDirection(this._rh[0]).multiplyScalar(-1.0);
        break;
      case '/':
        gen.heading.transformDirection(this._rh[1]).multiplyScalar(-1.0);
        break;
      case '|':
        gen.heading.multiplyScalar(-1.0);
        break;
      default:
        console.log("Unknown instruction: " + rule)
    }

    for (var i = 0; i < addedVertices; i++) {
      var j = this._vertices.length - addedVertices + i;
      this._vertexPositions[j * 3] = this._vertices[j][0];
      this._vertexPositions[j * 3 + 1] = this._vertices[j][1];
      this._vertexPositions[j * 3 + 2] = this._vertices[j][2];

      this._colors[j * 3] = this._color.x;
      this._colors[j * 3 + 1] = this._color.y;
      this._colors[j * 3 + 2] = this._color.z;
    }

    if (addedVertices == 0) {
      return false;
    }

    (<any>this._geometry.attributes).position.needsUpdate = true;
    (<any>this._geometry.attributes).color.needsUpdate = true;
    /*this._geometry.computeBoundingSphere();*/
    return true;
  }

  private resetGen(): void {
    this._genStack = [{
      str: "F",
      index: 0,
      currentVertex: [8.0, 0, 0],
      heading: (new THREE.Vector3(1.0, 0.0, 0.0)).normalize(),
      parent: -1

    }, {
        str: "F",
        index: 0,
        currentVertex: [0, -8.0, 0],
        heading: (new THREE.Vector3(0.0, -1.0, 0.0)).normalize(),
        parent: -1
      }, {
        str: "F",
        index: 0,
        currentVertex: [-8.0, 0, 0],
        heading: (new THREE.Vector3(-1.0, 0.0, 0.0)).normalize(),
        parent: -1
      }, {
        str: "F",
        index: 0,
        currentVertex: [0, 8.0, 0],
        heading: (new THREE.Vector3(0.0, 1.0, 0.0)).normalize(),
        parent: -1
      }, {

        str: "F",
        index: 0,
        currentVertex: [0.0, 0, 8.0],
        heading: (new THREE.Vector3(0.0, 0.0, 1.0)).normalize(),
        parent: -1
      }, {
        str: "F",
        index: 0,
        currentVertex: [0, 0, -8.0],
        heading: (new THREE.Vector3(0.0, 0.0, -1.0)).normalize(),
        parent: -1
      }];

    var stepCount = 0;
    while (stepCount < 5000) {
      this.lstep();
      stepCount = 0;
      for (var i = 0; i < this._genStack.length; i++) {
        stepCount += this._genStack[i].str.length;
      }
    }
  }

  private lstep(): void {

    for (var j = 0; j < this._genStack.length; j++) {
      var newGen = "";
      var gen: string = this._genStack[0].str;
      for (var i = 0; i < gen.length; i++) {
        if (this._rules[gen.charAt(i)]) {
          var choices = this._rules[gen.charAt(i)];
          var choice = Math.floor(Math.random() * choices.length);
          newGen += choices[choice];
        }
        else {
          newGen += gen.charAt(i);
        }
      }
      this._genStack[j].str = newGen;
    }
  }

  animate() {
    super.animate();

    var j = 0;
    while (this._genStack[j] && j < 4) {
      var gen = this._genStack[j];
      var i;
      if (gen.index >= gen.str.length) {
        this._genStack.splice(j, 1);
        continue;
      }

      var max = Math.min(gen.str.length, gen.index + Math.floor(this._growth));
      for (i = gen.index; i < max; i++) {
        var instruction = this._genStack[j].str.charAt(i);
        if (instruction == '[') {
          var end = i + 1;
          var bracketCount = 0;
          while (!(bracketCount == 0 && gen.str.charAt(end) == ']')) {
            bracketCount += gen.str.charAt(end) == '[' ? 1 : 0;
            bracketCount -= gen.str.charAt(end) == ']' ? 1 : 0;
            end++;
          }
          this._genStack.push({
            str: gen.str.substring(i + 1, end),
            index: 0,
            currentVertex: [
              gen.currentVertex[0],
              gen.currentVertex[1],
              gen.currentVertex[2]
            ],
            heading: gen.heading.clone(),
            parent: j
          });
          max += end - i;
          i = end;
        }
        else {
          this.addVertex(gen.str.charAt(i), gen)
        }
      }

      this._genStack[j].index = i;
      j++;
    }

    if (this._vertices.length >= 5000 || this._genStack.length == 0) {
      this._vertices = [];
      for (var i; i < this._vertexPositions.length; i++) {
        this._vertexPositions[i] = 0.0;
        this._colors[i] = 0.0;
      }

      this.resetGen();
    }

    this._line.rotateY(0.5 * this._dt);
    this._line.rotateZ(0.5 * this._dt);

    return {
      type: this.rendererId(),
      dt: this._dt,
      attributes: this._attributes
    }
  }

  rendererId(): string {
    return IDs.lsystem;
  }


}
