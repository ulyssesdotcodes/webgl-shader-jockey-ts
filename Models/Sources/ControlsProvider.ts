/// <reference path='./VolumeControl.ts'/>
/// <reference path='./HueControl.ts'/>

class ControlsProvider implements UniformProvider<any> {
  private _volumeControl: VolumeControl;
  private _hueControl: HueControl;

  constructor() {
    this._volumeControl = new VolumeControl();
    this._hueControl = new HueControl();
  }

  uniforms(): Array<IUniform<any>> {
    return [this._volumeControl.VolumeLevel, this._hueControl.HueShift];
  }

  updateVolume(volume: number) {
    this._volumeControl.updateVolume(volume);
  }

  updateHueShift(shift: number) {
    this._hueControl.updateHueShift(shift);
  }
}
