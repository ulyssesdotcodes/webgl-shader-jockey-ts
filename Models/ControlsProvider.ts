/// <reference path='./VolumeControl.ts'/>

class ControlsProvider implements IPropertiesProvider<any> {
  private _volumeControl: VolumeControl;

  constructor() {
    this._volumeControl = new VolumeControl();
  }

  glProperties(): Rx.Observable<Array<IUniform<any>>> {
    return Rx.Observable.just([this._volumeControl.VolumeLevel]);
  }

  updateVolume(volume: number) {
    this._volumeControl.updateVolume(volume);
  }
}
