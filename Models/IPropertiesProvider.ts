/// <reference path="../typed/rx.d.ts"/>
/// <reference path="./IGLProperty.ts"/>

interface IPropertiesProvider{
  glProperties(): Rx.Observable<Array<IGLProperty>>;
} 
