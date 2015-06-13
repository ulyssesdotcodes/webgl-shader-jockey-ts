class TimeSource implements Source<number> {
  private _startTime: number;
  private _timeSubject: Rx.Subject<number>;
  SourceObservable: Rx.Observable<number>;

  constructor() {
    this._startTime = Date.now();
    this._timeSubject = new Rx.Subject<number>();
    this.SourceObservable = this._timeSubject.asObservable();
  }

  animate() {
    this._timeSubject.onNext((this._startTime - Date.now()) / 1000.0);
  }
}
