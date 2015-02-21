/// <reference path="./IGLProperty.ts"/>

class TimeProperty implements IGLProperty {
  private _name = "time";
  private time: number;

  constructor(time: number) {
    this.time = time;
  }

  getName(): string {
    return this._name;
  }

  addToGL(uniforms: any): any {
    uniforms.time = {
      type: "f",
      value: this.time
    };
    return uniforms;
  }
} 