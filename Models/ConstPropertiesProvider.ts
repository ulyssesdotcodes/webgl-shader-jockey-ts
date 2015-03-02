class ConstPropertiesProvider implements IPropertiesProvider {
  private _propertiesSubject: Rx.Subject<Array<IGLProperty>>;

  constructor() {
    this._propertiesSubject = new Rx.Subject<Array<IGLProperty>>();
  }

  glProperties(): Rx.Observable<Array<IGLProperty>> {
    return this._propertiesSubject.asObservable();
  }

  updateProperties(properties: Array<IGLProperty>) {
    this._propertiesSubject.onNext(properties);
  }
} 