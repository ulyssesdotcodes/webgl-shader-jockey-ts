class EqPointCloudRenderer extends ObjectRenderer {
  private _pc: THREE.PointCloud;

  constructor(pointCloud: THREE.PointCloud) {
    super(pointCloud);
    this._pc = pointCloud;
  }

  update(update: any, resolution: THREE.Vector2) {
    super.update(update, resolution);

    this._pc.rotateY(update.loudness / 128.0);
    this._pc.rotateX(update.loudness / 256.0);
  }
}
