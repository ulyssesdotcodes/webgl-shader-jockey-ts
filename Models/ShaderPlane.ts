class ShaderPlane {
  private _mesh: THREE.Mesh;
  get mesh() {
    return this._mesh;
  }

  constructor(shader: ShaderText, uniforms: Array<IUniform<any>>) {
    var fragText: string = shader.fragmentShader;

    var uniformObject = {};

    uniforms.forEach(uniform => uniformObject[uniform.name] = uniform);

    Object.keys(uniformObject).forEach((key) => {
      var uniform: IUniform<any> = uniformObject[key];
      var uniformType: string;
      switch (uniform.type) {
        case "f":
          uniformType = "float";
          break;
        case "v2":
          uniformType = "vec2";
          break;
        case "v3":
          uniformType = "vec3";
          break;
        case "v4":
          uniformType = "vec4";
          break;
        case "t":
          uniformType = "sampler2D";
          break;
        default:
          console.log("Unknown shader");
      }

      fragText = "uniform " + uniformType + " " + uniform.name + ";\n" + fragText;
    });

    var shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniformObject,
      fragmentShader: fragText,
      vertexShader: shader.vertexShader
    });

    var geometry = new THREE.PlaneBufferGeometry(2, 2);
    this._mesh = new THREE.Mesh(geometry, shaderMaterial);
  }
}
