/// <reference path='./VolumeControl.ts'/>
/// <reference path='./HueControl.ts'/>

class ControlsProvider implements IPropertiesProvider<any> {
  private _volumeControl: VolumeControl;
  private _hueControl: HueControl;

  constructor() {
    this._volumeControl = new VolumeControl();
    this._hueControl = new HueControl();
  }

  glProperties(): Rx.Observable<Array<IUniform<any>>> {
    return Rx.Observable.just([this._volumeControl.VolumeLevel, this._hueControl.HueShift]);
  }

  updateVolume(volume: number) {
    this._volumeControl.updateVolume(volume);
  }

  updateHueShift(shift: number) {
    this._hueControl.updateHueShift(shift);
  }
}
