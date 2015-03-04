class ShaderText {
  fragmentShader: string;
  vertextShader: string;

  constructor(fragment: string, vertex: string) {
    this.fragmentShader = fragment;
    this.vertextShader = vertex;
  }
}
