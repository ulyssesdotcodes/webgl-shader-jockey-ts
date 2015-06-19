/// <reference path="./Attribute"/>

class UniformUtils {
  static createShaderMaterialUniforms(shader: ShaderText, uniforms: Array<IUniform<any>>): THREE.ShaderMaterial {
    return this.createShaderMaterialUniformsAttributes(shader, uniforms, []);
  }


  static createShaderMaterialUniformsAttributes(shader: ShaderText, uniforms: Array<IUniform<any>>, attributes: Array<Attribute<any>>): THREE.ShaderMaterial {

    var fragText: string = shader.fragmentShader;
    var vertText: string = shader.vertexShader;

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
        case "c":
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
      vertText = "uniform " + uniformType + " " + uniform.name + ";\n" + vertText;
    });

    var attributeObject = {};

    attributes.forEach(attribute => attributeObject[attribute.name] = attribute);

    Object.keys(attributeObject).forEach((key) => {
      var attribute: Attribute<any> = attributeObject[key];
      var uniformType: string;
      switch (attribute.type) {
        case "f":
          uniformType = "float";
          break;
        case "v2":
          uniformType = "vec2";
          break;
        case "c":
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

      vertText = "attribute " + uniformType + " " + attribute.name + ";\n" + vertText;
    });


    return new THREE.ShaderMaterial({
      uniforms: uniformObject,
      attributes: attributeObject,
      fragmentShader: fragText,
      vertexShader: vertText
    });
  }
}
