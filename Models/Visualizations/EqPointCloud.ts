/// <reference path="./PointCloudVisualization"/>

class EqPointCloud extends PointCloudVisualization {
  static ID = "eqPointCloud"

  private static POINT_COUNT = 80000;
  private static CUBE_SIZE = 86;

  private _audioSource: AudioSource;

  private _colorBuffer: Array<THREE.Color>;
  private _vertices: Array<THREE.Vector3>;

  private _material: THREE.ShaderMaterial;

  private _pc: THREE.PointCloud;

  private _loudness: number;
  private _eqs: IUniform<THREE.Vector3>;

  private _eq1: IUniform<THREE.Vector3>;
  private _eq2: IUniform<THREE.Vector3>;
  private _eq3: IUniform<THREE.Vector3>;

  private _eq1Vel: THREE.Vector3;
  private _eq2Vel: THREE.Vector3;
  private _eq3Vel: THREE.Vector3;


  constructor(audioSource: AudioSource, resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, controlsProvider?: ControlsProvider) {
    super(resolutionProvider, timeSource, shaderLoader, "eq_pointcloud", controlsProvider);

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
    }

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
  }

  protected setupVisualizerChain(): void {
    super.setupVisualizerChain();

    this.addDisposable(
      this._audioSource.observable()
        .map((e) => AudioUniformFunctions.calculateEqs(e, 3))
        .subscribe((eqs: Array<number>) => {
        this._eqs.value = new THREE.Vector3(eqs[0], eqs[1], eqs[2]);
      })
      );

    this.addDisposable(
      this._audioSource.observable()
        .map((e) => AudioUniformFunctions.calculateLoudness(e))
        .subscribe((l) => this._loudness = l)
      );
  }

  protected createPointCloudVisualization(shaderMaterial: THREE.ShaderMaterial) {
    this._material = shaderMaterial;
    this._pc = this.createPointCloud(EqPointCloud.POINT_COUNT, shaderMaterial,
      (i: number) =>
        new THREE.Vector3(
          Math.random() * EqPointCloud.CUBE_SIZE - EqPointCloud.CUBE_SIZE * 0.5,
          Math.random() * EqPointCloud.CUBE_SIZE - EqPointCloud.CUBE_SIZE * 0.5,
          Math.random() * EqPointCloud.CUBE_SIZE - EqPointCloud.CUBE_SIZE * 0.5));

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
  }

  animate() {
    super.animate();
    if (this._material) {
      this._material.attributes.color.needsUpdate = true;
    }

    if (this._pc) {
      this._pc.rotateY(this._loudness / 128.0);
      this._pc.rotateX(this._loudness / 256.0);

      this.updateEqWithVelocity(this._eq1, this._eq1Vel);
      this.updateEqWithVelocity(this._eq2, this._eq2Vel);
      this.updateEqWithVelocity(this._eq3, this._eq3Vel);
    }
  }

  updateEqWithVelocity(eq: IUniform<THREE.Vector3>, eqVel: THREE.Vector3): void {
    eq.value.add(eqVel);

    if (eq.value.x > EqPointCloud.CUBE_SIZE * 0.5 || eq.value.x < -EqPointCloud.CUBE_SIZE * 0.5) {
      eqVel.setX(-eqVel.x);
    }

    if (eq.value.y > EqPointCloud.CUBE_SIZE * 0.5 || eq.value.y < -EqPointCloud.CUBE_SIZE * 0.5) {
      eqVel.setY(-eqVel.y);
    }

    if (eq.value.z > EqPointCloud.CUBE_SIZE * 0.5 || eq.value.z < -EqPointCloud.CUBE_SIZE * 0.5) {
      eqVel.setZ(-eqVel.z);
    }
  }
}
