/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/three.d.ts"/>

class UniformsManager {
  private _uniforms: any;
  get uniforms() {
    return this._uniforms;
  }

  constructor() {
    this._uniforms = {};
  }

  static fromPropertyProviders(propertiesProviders: Array<IPropertiesProvider>): UniformsManager {
    var uniformsManager = new UniformsManager();

    Rx.Observable.merge(
      Rx.Observable.from(propertiesProviders)
        .flatMap((provider) => provider.glProperties())
        .flatMap((properties) => Rx.Observable.from(properties)))
      .subscribe((property) => uniformsManager.createOrUpdateUniform(property));

    return uniformsManager;
  }

  createOrUpdateUniform(property: IGLProperty): void {
    this._uniforms[property.name()] = property.uniform();
  }
}