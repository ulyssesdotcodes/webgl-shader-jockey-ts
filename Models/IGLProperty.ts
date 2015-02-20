interface IGLProperty {
  name: string;
  addToGL(uniforms: any);
  getName(): string;
} 