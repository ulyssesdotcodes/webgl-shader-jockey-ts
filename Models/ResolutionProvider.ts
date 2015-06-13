class ResolutionProvider implements IPropertiesProvider<THREE.Vector2> {
  private _resolutionProperty: IUniform<THREE.Vector2>;

  constructor() {
    this._resolutionProperty = {
      name: "resolution",
      type: "v2",
      value: new THREE.Vector2(0, 0)
    }
  }

  uniforms(): Array<IUniform<any>> {
    return [this._resolutionProperty];
  }

  updateResolution(resolution: THREE.Vector2) {
    this._resolutionProperty.value = resolution;
  }
}
