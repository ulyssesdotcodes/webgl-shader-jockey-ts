/// <reference path="./VisualizationRenderer"/>
/// <reference path="../Sources/AudioSource"/>

class ShaderRenderer implements VisualizationRenderer{
  private _plane: THREE.Mesh;

  private _textures: any;
  private _buffers: any;

  constructor(plane: THREE.Mesh) {
    this._plane = plane;
    this._buffers = {};

    for(var name in (<THREE.ShaderMaterial>this._plane.material).uniforms) {
      var uniform = (<THREE.ShaderMaterial>this._plane.material).uniforms[name];
      if (uniform.type == "t") {
        this._buffers[uniform.name] = new Uint8Array(AudioSource.FFT_SIZE * 4);
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

        (<THREE.ShaderMaterial>this._plane.material).uniforms[uniform.name] = {
          name: uniform.name,
          type: "t",
          value: dataTexture
        };

        this.copyBuffer(uniform.value.image.data, this._buffers[uniform.name]);
        (<THREE.ShaderMaterial>this._plane.material).uniforms[uniform.name].value
            .needsUpdate = true;
      }
    }
  }

  update(update: any) {
    update.uniforms.forEach((uniform) => {
      if (uniform.type == "t") {
        this.copyBuffer(uniform.value.image.data, this._buffers[uniform.name]);
        (<THREE.ShaderMaterial>this._plane.material).uniforms[uniform.name].value
            .needsUpdate = true;
      }
      else {
        var newUniform = {
          type: uniform.type,
          name: uniform.name,
          value: uniform.value
        };
        (<THREE.ShaderMaterial>this._plane.material).uniforms[uniform.name] = newUniform;
      }
    });
  }

  copyBuffer(source: Uint8Array, dest: Uint8Array):void {
    for(var i = 0; i < source.length; i++) {
      dest[i] = source[i];
    }
  }
}
