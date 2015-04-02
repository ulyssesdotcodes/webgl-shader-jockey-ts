/// <reference path="./IUniform.ts"/>

interface IPropertiesProvider<T>{
  glProperties(): Rx.Observable<Array<IUniform<T>>>;
}
