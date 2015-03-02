/// <reference path="./IGLProperty.ts"/>

class TimeProperty implements IGLProperty {
  private _name = "time";
  private _type = "f";
  private _time: number;


  constructor(time: number) {
    this._time = time;
  }

  name(): string {
    return this._name;
  }

  type(): string {
    return this._type;
  }

  value(): number {
    return this._time;
  }

  uniform(): any {
    return { type: this.type(), value: this.value() };
  }
}
