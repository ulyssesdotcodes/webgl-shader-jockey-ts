class ConstPropertiesProvider implements IPropertiesProvider {
  private _propertiesSubject: Rx.Subject<Array<IUniform>>;

  constructor() {
    this._propertiesSubject = new Rx.Subject<Array<IUniform>>();
  }

  glProperties(): Rx.Observable<Array<IUniform>> {
    return this._propertiesSubject.asObservable();
  }

  updateProperties(properties: Array<IUniform>) {
    this._propertiesSubject.onNext(properties);
  }
}
