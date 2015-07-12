class GPGPUPointCloudRenderer extends ObjectRenderer {
  constructor(pc) {
    super(pc);
  }

  update(update:any, resolution:THREE.Vector2) {
    super.update(update, resolution);

    RendererUtils.copyBuffer(update.texturePosition, this._buffers["texturePosition"]); RendererUtils.copyBuffer(update.textureVelocity, this._buffers["textureVelocity"]);
    (<THREE.ShaderMaterial>this._object.material).uniforms["texturePosition"].value.needsUpdate = true;
    (<THREE.ShaderMaterial>this._object.material).uniforms["textureVelocity"].value.needsUpdate = true;
  }
}
