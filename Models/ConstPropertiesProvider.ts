/// <reference path='./IPropertiesProvider.ts' />

﻿class ConstPropertiesProvider implements IPropertiesProvider<any> {
  private _propertiesSubject: Rx.Subject<Array<IUniform<any>>>;

  constructor() {
    this._propertiesSubject = new Rx.Subject<Array<IUniform<any>>>();
  }

  glProperties(): Rx.Observable<Array<IUniform<any>>> {
    return this._propertiesSubject.asObservable();
  }

  updateProperties(properties: Array<IUniform<any>>) {
    this._propertiesSubject.onNext(properties);
  }
}
