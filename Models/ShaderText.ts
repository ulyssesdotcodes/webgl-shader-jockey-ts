class ShaderText {
  fragmentShader: string;
  vertexShader: string;

  constructor(fragment: string, vertex: string) {
    this.fragmentShader = fragment;
    this.vertexShader = vertex;
  }
}
