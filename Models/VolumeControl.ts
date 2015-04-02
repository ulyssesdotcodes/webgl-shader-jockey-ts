class VolumeControl {
  VolumeLevel: IUniform<number>;

  constructor() {
    this.VolumeLevel = {
      name: "volume",
      type: "f",
      value: 1.0
    };
  }

  updateVolume(volume: number) {
    this.VolumeLevel.value = volume;
  }
}
