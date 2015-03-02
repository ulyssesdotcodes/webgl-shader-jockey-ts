interface IShaderProvider {
  shaderObservable(): Rx.Observable<THREE.ShaderMaterial>;
} 