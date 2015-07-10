/// <reference path='../Control.ts'/>

class ControlsProvider implements UniformProvider<any> {
  private _controls: any;
  private _controlUniforms: Array<IUniform<any>>;

  private _controlSubject: Rx.Subject<Array<Control>>;

  constructor() {
    this._controls = {};
    this._controlUniforms = []

    this._controlSubject = new Rx.BehaviorSubject<Array<Control>>([]);
  }

  uniforms(): Array<IUniform<any>> {
    return this._controlUniforms;
  }

  uniformObject(): any {
    return this._controls;
  }

  updateControl(name: string, value: number) {
    this._controls[name].value = value;
  }

  controlsObservable(): Rx.Observable<Array<Control>> {
    return this._controlSubject.asObservable();
  }

  getValue(name: string) {
    return this._controls[name].value;
  }

  newControls(controls: Array<Control>) {
    var oldControls = this._controls;
    this._controls = {};
    this._controlUniforms = [];

    controls.forEach((control) => {
      if(oldControls[control.name]) {
        this._controls[control.name] = oldControls[control.name];
      }
      else {
        this._controls[control.name] = {
          name: control.name,
          type: "f",
          value: control.defVal
        };
      }

      this._controlUniforms.push(this._controls[control.name]);
    });

    this._controlSubject.onNext(controls);
  }
}
