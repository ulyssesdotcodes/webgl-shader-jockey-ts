/// <reference path='../typed/rx.time-lite.d.ts'/>

class VisualizationOptionsController {
  private _visualizationOptions: Array<VisualizationOption>;
  private _visualizationOptionSubject: Rx.Subject<VisualizationOption>;
  VisualizationOptionObservable: Rx.Observable<VisualizationOption>;

  private _autoplay: boolean;
  private _autoplaySub: Rx.IDisposable;

  private _currentOption: number;
  private _currentOptionSubject: Rx.BehaviorSubject<number>;

  constructor(shaders: Array<VisualizationOption>) {
    this._visualizationOptions = shaders;
    this._visualizationOptionSubject = new Rx.Subject<VisualizationOption>();
    this.VisualizationOptionObservable = this._visualizationOptionSubject.asObservable().startWith(this._visualizationOptions[0]);

    this._currentOption = 0;
    this._currentOptionSubject = new Rx.BehaviorSubject<number>(this._currentOption);
    this.startAutoplayTimer();
  }

  shaderNames() {
    var shaderNames: Array<string> = [];
    this._visualizationOptions.forEach((shader) => shaderNames.push(shader.name));
    return shaderNames;
  }

  currentShaderObservable(): Rx.Observable<number> {
    return this._currentOptionSubject.asObservable();
  }

  onOptionName(shaderName: string): void {
    for (var i = 0; i < this._visualizationOptions.length; i++) {
      if (this._visualizationOptions[i].name == shaderName) {
        this.updateOption(i);
        break;
      }
    }

  }

  updateOption(index: number) {
    if (this._currentOption == index) {
      return;
    }

    var option = this._visualizationOptions[index];
    if (option != undefined) {
      this._currentOption = index;
      this._currentOptionSubject.onNext(this._currentOption);
      this._visualizationOptionSubject.onNext(option);
    }
  }

  onAutoplayChanged(autoplay: boolean): void {
    if (autoplay) {
      this.startAutoplayTimer();
    }
    else {
      this._autoplaySub.dispose();
    }
  }

  startAutoplayTimer(): void {
    this._autoplaySub = Rx.Observable.timer(30000).subscribe(__ => {
      this.updateOption(((1 + this._currentOption) % this._visualizationOptions.length));
      this.startAutoplayTimer();
    });
  }
}
