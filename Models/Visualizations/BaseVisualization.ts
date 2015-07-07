class BaseVisualization {
  private _created = false;
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

  onCreated() {
    this._created = true;
  }

  animate(): any {
    if(this._created) {
      this._sources.forEach(source => source.animate());
    }
  }

  object3DObservable(): Rx.Observable<Array<THREE.Object3D>> {
    console.log("Yo, you forgot to implement meshObservable().")
    return null;
  }

  unsubscribe(): void {
    this._disposable.dispose();
  }

  rendererId(): string {
    return "";
  }
}
