
class TimeProperty implements IGLProperty {
    name: string;
    private time;
    constructor(time: number);
    getName(): string;
    addToGL(uniforms: any): any;
}
