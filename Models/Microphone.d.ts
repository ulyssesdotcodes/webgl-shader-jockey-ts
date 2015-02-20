declare class Microphone {
    private created;
    private node;
    private nodeSubject;
    constructor();
    emitNode(audioContext: AudioContext): void;
    getNodeObservable(): Rx.Observable<AudioSourceNode>;
}
