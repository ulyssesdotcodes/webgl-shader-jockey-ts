/// <reference path='../Models/Sources/ControlsProvider.ts'/>

class ControlsController {
  UniformsProvider: ControlsProvider;

  constructor(controlsProvider:ControlsProvider) {
    this.UniformsProvider = controlsProvider;
  }

  onVolumeChange(volume: string) {
    this.UniformsProvider.updateVolume(parseFloat(volume));
  }

  onHueShiftChange(shift: string) {
    this.UniformsProvider.updateHueShift(parseFloat(shift));
  }}
