/// <reference path='../Models/ControlsProvider.ts'/>

class ControlsController {
  UniformsProvider: ControlsProvider;

  constructor() {
    this.UniformsProvider = new ControlsProvider();
  }

  onVolumeChange(volume: string) {
    this.UniformsProvider.updateVolume(parseFloat(volume));
  }

  onHueShiftChange(shift: string) {
    this.UniformsProvider.updateHueShift(parseFloat(shift));
  }
}
