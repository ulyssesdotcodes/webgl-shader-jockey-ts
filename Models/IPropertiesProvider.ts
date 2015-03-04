/// <reference path="./IUniform.ts"/>

interface IPropertiesProvider{
  glProperties(): Rx.Observable<Array<IUniform>>;
}
