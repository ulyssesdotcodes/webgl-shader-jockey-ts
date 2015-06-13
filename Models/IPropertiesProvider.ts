/// <reference path="./IUniform.ts"/>

interface IPropertiesProvider<T> {
  uniforms(): Array<IUniform<any>>;
}
