/// <reference path='../typed/rx.time-lite.d.ts'/>

class ShadersController {
  private _shaders: Array<Shader>;
  private _shaderUrlSubject: Rx.Subject<string>;
  ShaderUrlObservable: Rx.Observable<string>;

  private _autoplay: boolean;
  private _autoplaySub: Rx.IDisposable;

  private _currentShader: number;
  private _currentShaderSubject: Rx.BehaviorSubject<number>;

  constructor(shaders: Array<Shader>) {
    this._shaders = shaders;
    this._shaderUrlSubject = new Rx.Subject<string>();
    this.ShaderUrlObservable = this._shaderUrlSubject.asObservable();

    this._currentShader = 0;
    this._currentShaderSubject = new Rx.BehaviorSubject<number>(this._currentShader);
    this.startAutoplayTimer();
  }

  shaderNames() {
    var shaderNames: Array<string> = [];
    this._shaders.forEach((shader) => shaderNames.push(shader.name));
    return shaderNames;
  }

  currentShaderObservable(): Rx.Observable<number> {
    return this._currentShaderSubject.asObservable();
  }

  onShaderName(shaderName: string): void {
    var shaderUrl: string;

    for (var i = 0; i < this._shaders.length; i++) {
      if (this._shaders[i].name == shaderName) {
        this.updateShader(i);
        break;
      }
    }

  }

  updateShader(index: number) {
    if(this._currentShader == index) {
      return;
    }

    var shader = this._shaders[index];
    if (shader != undefined) {
      this._currentShader = index;
      this._currentShaderSubject.onNext(this._currentShader);
      this._shaderUrlSubject.onNext(shader.url);
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
        this.updateShader(((1 + this._currentShader) % this._shaders.length));
        this.startAutoplayTimer();
      });
  }
}
