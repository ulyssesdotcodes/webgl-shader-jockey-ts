class WindowMessagerReceiver {
  private _messageSubject: Rx.Subject<any>;
  ShaderObservable: Rx.Observable<any>;
  UniformsObservable: Rx.Observable<any>;

  constructor() {
    this._messageSubject = new Rx.Subject<any>();
    this.ShaderObservable = this._messageSubject.asObservable()
      .filter(message => message.type === "shader");
    this.UniformsObservable = this._messageSubject.asObservable()
      .filter(message => message.type === "uniforms");

    window.addEventListener("message", this.receiveMessage);
  }

  receiveMessage(event: MessageEvent): void {
    this._messageSubject.onNext(event.data);
  }
}
