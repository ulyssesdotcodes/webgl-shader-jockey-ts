/// <reference path="../IUniform.ts"/>

interface UniformProvider<T> {
  uniforms(): Array<IUniform<any>>;
}
