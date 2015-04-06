class ShaderPlane {
  private _mesh: THREE.Mesh;
  get mesh() {
    return this._mesh;
  }

  constructor(material: THREE.ShaderMaterial) {
    var geometry = new THREE.PlaneBufferGeometry(2, 2);
    this._mesh = new THREE.Mesh(geometry, material);
  }
}
