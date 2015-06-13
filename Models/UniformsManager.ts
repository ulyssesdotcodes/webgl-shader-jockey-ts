/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/three.d.ts"/>

class UniformsManager {
  private _uniformsSubject: Rx.Subject<any>;
  UniformsObservable: Rx.Observable<any>;
  private _propertiesProviders: Array<UniformProvider<any>>;

  constructor(propertiesProviders: Array<UniformProvider<any>>) {
    this._uniformsSubject = new Rx.Subject();
    this.UniformsObservable = this._uniformsSubject.asObservable();
    this._propertiesProviders = propertiesProviders;
  }

  calculateUniforms() {
    Rx.Observable.from(this._propertiesProviders)
      .map((provider) => provider.uniforms())
      .scan((acc, properties) => {
      properties.forEach((property) => acc[property.name] = property, {});
      return acc;
    })
      .subscribe((properties) => this._uniformsSubject.onNext(properties));
  }
}
