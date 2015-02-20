interface IGLProperty {
    name: string;
    addToGL(uniforms: any): any;
    getName(): string;
}
