/// <reference path='../Models/Sources/ControlsProvider.ts'/>

class ControlsController {
  private _controlsProvider: ControlsProvider;

  constructor(controlsProvider:ControlsProvider) {
    this._controlsProvider = controlsProvider;
  }

  controlsObservable(): Rx.Observable<Array<Control>> {
    return this._controlsProvider.controlsObservable();
  }

  onControlChange(name: string, value: number):void {
    this._controlsProvider.updateControl(name, value);
  }
}
