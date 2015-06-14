interface Source<T> {
  observable(): Rx.Observable<T>;
  animate(): void;
}
