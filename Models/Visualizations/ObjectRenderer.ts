/// <reference path="./VisualizationRenderer"/>
/// <reference path="../Sources/AudioSource"/>
/// <reference path="./RendererUtils"/>
/// <reference path="../ObjectMaterial"/>

class ObjectRenderer implements VisualizationRenderer {
  private _material: THREE.ShaderMaterial;

  private _textures: any;
  private _buffers: any;
  private _object: ObjectMaterial;

  constructor(object: ObjectMaterial) {
    this._object = object;
    this._buffers = {};

    if ((<THREE.ShaderMaterial>this._object.material).uniforms) {
      for (var name in (<THREE.ShaderMaterial>this._object.material).uniforms) {
        var uniform = (<THREE.ShaderMaterial>this._object.material).uniforms[name];
        if (uniform.type == "t") {
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
          console.log(dataTexture);
        }
      }
    }

    console.log((<THREE.ShaderMaterial>this._object.material))
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

  update(update: any, resolution: THREE.Vector2): void {
    if (update.uniforms) {
      update.uniforms.forEach((uniform) => {
        if(uniform.name == "resolution") {
          (<THREE.ShaderMaterial>this._object.material).uniforms[uniform.name].value = resolution;
        }
        else if (uniform.type == "t") {
          RendererUtils.copyBuffer(uniform.value.image.data, this._buffers[uniform.name]);
          (<THREE.ShaderMaterial>this._object.material).uniforms[uniform.name].value
          .needsUpdate = true;
        }
        else {
          var newUniform = {
            type: uniform.type,
            name: uniform.name,
            value: uniform.value
          };
          (<THREE.ShaderMaterial>this._object.material).uniforms[uniform.name] = newUniform;
        }
      });
    }

    if (update.attributes) {
      update.attributes.forEach((attr) => {
        RendererUtils.copyBuffer(attr.value, this._buffers[attr.name]);

        (<THREE.ShaderMaterial>this._object.material).attributes[attr.name].needsUpdate = true;
      })
    }
  }
}
