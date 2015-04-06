class HueControl {
  HueShift: IUniform<number>;

  constructor() {
    this.HueShift = {
      name: "hue",
      type: "f",
      value: 0.0
    };
  }

  updateHueShift(shift: number) {
    this.HueShift.value = shift;
  }
}
