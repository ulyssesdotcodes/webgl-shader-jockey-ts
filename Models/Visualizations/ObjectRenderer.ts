/// <reference path="./VisualizationRenderer"/>
/// <reference path="../Sources/AudioSource"/>
/// <reference path="./RendererUtils"/>
/// <reference path="../ObjectMaterial"/>

class ObjectRenderer implements VisualizationRenderer {
  private _material: THREE.ShaderMaterial;

  private _textures: any;
  protected _buffers: any;
  private _object: ObjectMaterial;

  constructor(object: ObjectMaterial) {
    this._object = object;
    this._buffers = {};

    if ((<THREE.ShaderMaterial>this._object.material).uniforms) {
      var uniforms = (<THREE.ShaderMaterial>this._object.material).uniforms;
      for (var name in uniforms) {
        var uniform = uniforms[name];
        if (uniform.type == "t") {
          if (uniform.value.image.nodeName &&
            uniform.value.image.nodeName.toLowerCase() === "canvas") {
            var canvas = document.createElement("canvas");
            canvas.width = 1024;
            canvas.height = 1024;
            this._buffers[uniform.name] = canvas.getContext("2d");

            (<THREE.ShaderMaterial>this._object.material).uniforms[uniform.name] = {
              name: uniform.name,
              type: "t",
              value: new THREE.Texture(canvas)
            }
          }
          else {
            this._buffers[uniform.name] = new Uint8Array(uniform.value.image.data.length);
            var dataTexture = new THREE.DataTexture(
              this._buffers[uniform.name],
              AudioSource.FFT_SIZE,
              1,
              THREE.RGBAFormat,
              THREE.UnsignedByteType,
              THREE.UVMapping,
              THREE.ClampToEdgeWrapping,
              THREE.ClampToEdgeWrapping,
              THREE.LinearFilter,
              THREE.LinearMipMapLinearFilter,
              1);

            (<THREE.ShaderMaterial>this._object.material).uniforms[uniform.name] = {
              name: uniform.name,
              type: "t",
              value: dataTexture
            };

            RendererUtils.copyBuffer(uniform.value.image.data, this._buffers[uniform.name]);
            (<THREE.ShaderMaterial>this._object.material).uniforms[uniform.name].value
            .needsUpdate = true;
          }
        }
      }
    }

    if ((<THREE.ShaderMaterial>this._object.material).attributes) {
      for (var name in (<THREE.ShaderMaterial>this._object.material).attributes) {
        console.log(name);
        var attr = (<THREE.ShaderMaterial>this._object.material).attributes[name];
        this._buffers[attr.name] = attr.value;
        (<THREE.ShaderMaterial>this._object.material).attributes[name] = {
          name: attr.name,
          type: attr.type,
          value: this._buffers[attr.name]
        }
      }
    }
  }

  update(updateData: any, resolution: THREE.Vector2): void {
    if (updateData.uniforms) {
      updateData.uniforms.forEach((uniform) => {
        if (uniform.name == "resolution") {
          (<THREE.ShaderMaterial>this._object.material).uniforms[uniform.name].value = resolution;
        }
        else if (uniform.type == "t") {
          if(uniform.value.image.nodeName &&
            uniform.value.image.nodeName.toLowerCase() === "canvas") {
            this._buffers[uniform.name].drawImage(uniform.value.image, 0, 0);
          }
          else {
            RendererUtils.copyBuffer(uniform.value.image.data,
              this._buffers[uniform.name]);
          }
          (<THREE.ShaderMaterial>this._object.material).uniforms[uniform.name].value
            .needsUpdate = true;
        }
        else if (uniform.type.startsWith("v")) {
          var arr = [];
          uniform.value.toArray(arr);
          (<THREE.ShaderMaterial>this._object.material).uniforms[uniform.name].value
            .fromArray(arr);
        }
        else {
          (<THREE.ShaderMaterial>this._object.material).uniforms[uniform.name].value =
          uniform.value;
        }
      });
    }

    if (updateData.attributes) {
      updateData.attributes.forEach((attr) => {
        RendererUtils.copyBuffer(attr.value, this._buffers[attr.name]);

        (<THREE.ShaderMaterial>this._object.material).attributes[attr.name].needsUpdate = true;
      })
    }
  }
}
