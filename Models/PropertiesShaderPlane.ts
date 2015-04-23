/// <reference path="../typed/rx.d.ts"/>
/// <reference path="./ShaderPlane.ts"/>
/// <reference path="./UniformsManager.ts"/>

class PropertiesShaderPlane {
  private _shaderSubject: Rx.Subject<ShaderText>;
  private _meshSubject: Rx.Subject<THREE.Mesh>;
  private _uniformsManager: UniformsManager;
  MeshObservable: Rx.Observable<THREE.Mesh>;

  constructor(properties: Rx.Observable<IUniform<any>[]>) {
    this._shaderSubject = new Rx.Subject<ShaderText>();
    this._meshSubject = new Rx.Subject<THREE.Mesh>();
    this.MeshObservable = this._meshSubject.asObservable();

    this._uniformsManager = new UniformsManager(properties);

    Rx.Observable.combineLatest(this._shaderSubject, this._uniformsManager.UniformsObservable,
      (shaderText, uniforms) => {
        var fragText: string = shaderText.fragmentShader;

        Object.keys(uniforms).forEach((key) => {
          var uniform: IUniform<any> = uniforms[key];
          var uniformType: string;
          switch (uniform.type) {
            case "f":
              uniformType = "float";
              break;
            case "v2":
              uniformType = "vec2";
              break;
            case "t":
              uniformType = "sampler2D";
              break;
          }

          fragText = "uniform " + uniformType + " " + uniform.name + ";\n" + fragText;
        });


        return new THREE.ShaderMaterial({
          uniforms: uniforms,
          fragmentShader: fragText,
          vertexShader: shaderText.vertextShader
        });
      }
      )
      .map((shader) => new ShaderPlane(shader).mesh)
      .subscribe(this._meshSubject);
  }

  onShaderText(shader: ShaderText) {
    /* Calculate the uniforms after it's subscribed to*/
    this._uniformsManager.calculateUniforms();
    this._shaderSubject.onNext(shader);
  }
}
