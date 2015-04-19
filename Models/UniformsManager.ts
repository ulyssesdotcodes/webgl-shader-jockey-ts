/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/three.d.ts"/>

class UniformsManager {
  private _uniformsSubject: Rx.Subject<any>;
  UniformsObservable: Rx.Observable<any>;
  private _properties: Rx.Observable<IUniform<any>[]>;

  constructor(properties: Rx.Observable<IUniform<any>[]>) {
    this._uniformsSubject = new Rx.Subject();
    this.UniformsObservable = this._uniformsSubject.asObservable();
    this._properties= properties;
  }

  calculateUniforms() {
    this._properties
      .flatMap(Rx.Observable.from)
      .scan({}, (acc, property) => {
        acc[property.name] = property;
        return acc;
      })
      .subscribe((properties) => this._uniformsSubject.onNext(properties));
  }
}
