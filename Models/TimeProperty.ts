class TimeProperty implements IGLProperty {
  name = "time";
  private time: number;

  constructor(time: number) {
    this.time = time;
  }

  getName(): string {
    return this.name;
  }

  addToGL(uniforms: any): any {
    uniforms.time = {
      type: "f",
      value: this.time
    };
    return uniforms;
  }
} 