interface Source<T> {
  SourceObservable: Rx.Observable<T>;
  animate(): void;
}
