class ResolutionProvider implements IPropertiesProvider {
  private _resolutionSubject: Rx.Subject<IGLProperty> = new Rx.Subject<IGLProperty>();
  glProperties() {
    return this._resolutionSubject.asObservable().map(resolution => [resolution]);
  }

  updateResolution(resolution: THREE.Vector2) {
    this._resolutionSubject.onNext({
      name() {
        return "resolution";
      },
      type() {
        return "v2";
      },
      value() {
        return resolution;
      },
      uniform() {
        return { type: "v2", value: resolution };
      }
    })
  }
}
