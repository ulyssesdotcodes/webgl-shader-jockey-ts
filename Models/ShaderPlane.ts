/// <reference path="./UniformUtils"/>

﻿class ShaderPlane {
  private _mesh: THREE.Mesh;
  get mesh() {
    return this._mesh;
  }

  constructor(shader: ShaderText, uniforms: Array<IUniform<any>>) {
    var shaderMaterial = UniformUtils.createShaderMaterialUniforms(shader, uniforms);
    var geometry = new THREE.PlaneBufferGeometry(2, 2);
    this._mesh = new THREE.Mesh(geometry, shaderMaterial);
  }
}
