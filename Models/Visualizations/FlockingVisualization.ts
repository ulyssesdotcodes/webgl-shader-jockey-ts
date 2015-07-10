class FlockingVisualization extends PointCloudVisualization {
  static ID = "flocking";
  private static POINT_TEX_WIDTH = 64;
  private static POINT_COUNT = FlockingVisualization.POINT_TEX_WIDTH *
  FlockingVisualization.POINT_TEX_WIDTH;
  private static CUBE_SIZE = 32;

  private _vertices: Array<THREE.Vector3>;

  private _material: THREE.ShaderMaterial;

  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _camera: THREE.Camera;

  private _deltaUniform: IUniform<number>;
  private _resolutionUniform: IUniform<THREE.Vector2>;

  /*private _textureUniforms: Array<IUniform<any>>;*/
  /*private _positionUniforms: Array<IUniform<any>>;
  private _velocityUniforms: Array<IUniform<any>>;*/

  private _textureShader: THREE.ShaderMaterial;
  private _positionShader: THREE.ShaderMaterial;
  private _velocityShader: THREE.ShaderMaterial;

  private _textureMesh: THREE.Mesh;

  private _rtPosition1: THREE.WebGLRenderTarget;
  private _rtPosition2: THREE.WebGLRenderTarget;
  private _rtVelocity1: THREE.WebGLRenderTarget;
  private _rtVelocity2: THREE.WebGLRenderTarget;

  private _flipflop = true;

  private _pc: THREE.PointCloud;

  constructor(renderer: THREE.WebGLRenderer, audioSource: AudioSource, resolutionProvider: ResolutionProvider, timeSource: TimeSource, shaderLoader: ShaderLoader, controlsProvider?: ControlsProvider) {
    super(resolutionProvider, timeSource, shaderLoader, "flocking/point", controlsProvider);

    this._renderer = renderer;
    this._scene = new THREE.Scene();
    this._camera = new THREE.Camera();
    this._camera.position.z = 1.0;

    this._resolutionUniform =
    { name: "resolution", type: "v2", value: new THREE.Vector2(FlockingVisualization.POINT_TEX_WIDTH, FlockingVisualization.POINT_TEX_WIDTH) };

    this._deltaUniform = {
      name: "delta",
      type: "f",
      value: 0.0
    };

    var textureShaderObs = shaderLoader.getShaderFromServer("flocking/texture")
      .map((shaderText) => {

      var timeUniforms = [
        this._timeUniform,
        this._resolutionUniform,
        { name: "texture", type: "t", value: null }
      ];

      return (new ShaderPlane(shaderText, timeUniforms)).mesh;
    })
      .doOnNext((mesh) => {
      this._textureMesh = mesh;
      this._textureShader = <THREE.ShaderMaterial>this._textureMesh.material;
      this._scene.add(this._textureMesh);
    });

    var positionShaderObs = shaderLoader.getVariedShaderFromServer("flocking/position", "flocking/texture")
      .map((shaderText) => {
      var positionUniforms = [
        this._timeUniform,
        this._deltaUniform,
        this._resolutionUniform,
        { name: "texturePosition", type: "t", value: null },
        { name: "textureVelocity", type: "t", value: null }
      ];

      return UniformUtils.createShaderMaterialUniforms(shaderText, positionUniforms);
    })
      .doOnNext((pos) => this._positionShader = pos);

    var velocityShaderObs = shaderLoader.getVariedShaderFromServer("flocking/velocity", "flocking/texture")
      .map((shaderText) => {
      var velocityUniforms = [
        this._timeUniform,
        this._deltaUniform,
        this._resolutionUniform,
        { name: "texturePosition", type: "t", value: null },
        { name: "textureVelocity", type: "t", value: null },
        { name: "separationDistance", type: "f", value: 4.0 },
        { name: "alignmentDistance", type: "f", value: 4.0 },
        { name: "cohesionDistance", type: "f", value: 4.0 },
        { name: "freedomFactor", type: "f", value: 5.0 }
      ];

      return UniformUtils.createShaderMaterialUniforms(shaderText, velocityUniforms);
    })
      .doOnNext((vel) => this._velocityShader = vel);

    Rx.Observable.zip(
      textureShaderObs,
      positionShaderObs,
      velocityShaderObs,
      (tex, pos, vel) => {
        return {
          pos: this.generateTexture(),
          vel: this.generateVelocityTexture()
        }
      })
      .subscribe((startTex) => {
      this.renderTexture(startTex.pos, this._rtPosition1);
      this.renderTexture(this._rtPosition1, this._rtPosition2);

      this.renderTexture(startTex.vel, this._rtVelocity1);
      this.renderTexture(this._rtVelocity1, this._rtVelocity2);
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

  protected setupVisualizerChain(): void {
    this.addDisposable(this._timeSource.observable().subscribe((time) => {
      this._deltaUniform.value = time - this._timeUniform.value;
    }));
    super.setupVisualizerChain();
  }

  protected createPointCloudVisualization(shaderMaterial: THREE.ShaderMaterial) {
    this._pc = this.createPointCloud(FlockingVisualization.POINT_COUNT, shaderMaterial, (i) => new THREE.Vector3(Math.random() * 32.0, Math.random() * 32.0, Math.random() * 32.0));

    var reference = shaderMaterial.attributes.reference.value;
    var pointVertex = shaderMaterial.attributes.pointVertex.value;

    for (var v = 0; v < this._pc.geometry.vertices.length; v++) {
      var i = ~~(v / 3);
      var x = ~(i % FlockingVisualization.POINT_TEX_WIDTH) /
        FlockingVisualization.POINT_TEX_WIDTH;
      var y = (i % FlockingVisualization.POINT_TEX_WIDTH) /
        FlockingVisualization.POINT_TEX_WIDTH;

      reference[v] = new THREE.Vector2(x, y);
      pointVertex[v] = v % 9;
    }

    return [this._pc];
  }

  animate() {
    super.animate();
    if (!this._pc) {
      return;
    }

    if (this._flipflop) {
      this.renderVelocity(this._rtPosition1, this._rtVelocity1, this._rtVelocity2);
      this.renderPosition(this._rtPosition1, this._rtVelocity2, this._rtPosition2);
      (<THREE.ShaderMaterial>this._pc.material).uniforms.texturePosition.value =
      this._rtPosition2;
      (<THREE.ShaderMaterial>this._pc.material).uniforms.textureVelocity.value =
      this._rtVelocity2;
    }
    else {
      this.renderVelocity(this._rtPosition2, this._rtVelocity2, this._rtVelocity1);
      this.renderPosition(this._rtPosition2, this._rtVelocity1, this._rtPosition1);
      (<THREE.ShaderMaterial>this._pc.material).uniforms.texturePosition.value =
      this._rtPosition1;
      (<THREE.ShaderMaterial>this._pc.material).uniforms.textureVelocity.value = this._rtVelocity1;
    }

    this._flipflop = !this._flipflop;
  }

  getRenderTarget(): THREE.WebGLRenderTarget {
    return new THREE.WebGLRenderTarget(
      FlockingVisualization.POINT_TEX_WIDTH,
      FlockingVisualization.POINT_TEX_WIDTH,
      {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false
      });
  }

  renderTexture(input: any, output: THREE.WebGLRenderTarget): void {
    if (!this._textureMesh) {
      return;
    }

    this._textureMesh.material = this._textureShader;
    this._textureShader.uniforms.texture.value = input;

    this._renderer.render(this._scene, this._camera, output);
  }

  renderPosition(position: THREE.WebGLRenderTarget, velocity: THREE.WebGLRenderTarget, output: THREE.WebGLRenderTarget): void {
    if (!this._textureMesh) {
      return;
    }
    this._textureMesh.material = this._positionShader;
    this._positionShader.uniforms.texturePosition.value = position;
    this._positionShader.uniforms.textureVelocity.value = velocity;
    this._renderer.render(this._scene, this._camera, output);
  }

  renderVelocity(position: THREE.WebGLRenderTarget, velocity: THREE.WebGLRenderTarget, output: THREE.WebGLRenderTarget): void {
    if (!this._textureMesh) {
      return;
    }
    this._textureMesh.material = this._velocityShader;
    this._velocityShader.uniforms.texturePosition.value = position;
    this._velocityShader.uniforms.textureVelocity.value = velocity;
    this._renderer.render(this._scene, this._camera, output);
  }

  generateTexture(): THREE.DataTexture {
    return this.generateDataTexture(() => Math.random() * FlockingVisualization.CUBE_SIZE -
      FlockingVisualization.CUBE_SIZE * 0.5);
  }

  generateVelocityTexture(): THREE.DataTexture {
    return this.generateDataTexture(() => Math.random() - 0.5);
  }

  generateDataTexture(positionFunc: () => number): THREE.DataTexture {
    var w = FlockingVisualization.POINT_TEX_WIDTH, h =
      FlockingVisualization.POINT_TEX_WIDTH;

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

    var texture = new THREE.DataTexture(
      a,
      FlockingVisualization.POINT_TEX_WIDTH,
      FlockingVisualization.POINT_TEX_WIDTH,
      THREE.RGBAFormat,
      THREE.FloatType,
      THREE.UVMapping,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      THREE.NearestFilter,
      THREE.NearestFilter,
      1);

    texture.flipY = true;
    texture.needsUpdate = true;

    return texture;
  }

}
