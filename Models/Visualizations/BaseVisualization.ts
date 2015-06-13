class BaseVisualization {
  private _sources: Array<Source<any>>;

  private _disposable: Rx.CompositeDisposable;

  constructor() {
    this._sources = [];
    this._disposable = new Rx.CompositeDisposable();
  }

  addSources(sources: Array<Source<any>>) {
    this._sources = this._sources.concat(sources);
  }

  addDisposable(disposable: Rx.Disposable): void {
    this._disposable.add(disposable);
  }

  animate() {
    this._sources.forEach(source => source.animate());
  }

  meshObservable(): Rx.Observable<Array<THREE.Mesh>> {
    console.log("Yo, you forgot to implement meshObservable().")
    return null;
  }

  unsubscribe(): void {
    this._disposable.dispose();
  }
}
