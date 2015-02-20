/// <reference path="../typed/rx.d.ts" />
/// <reference path="../typed/waa.d.ts" />
/// <reference path="IGLProperty.d.ts" />
/// <reference path="TimeProperty.d.ts" />
declare class AudioManager {
    static FFT_SIZE: number;
    private _audioContext;
    private renderTimeObservable;
    constructor(audioContext: AudioContext);
    updateSourceNode(sourceNode: AudioSourceNode): void;
    context: AudioContext;
    audioGLPropertiesObservable: Rx.Observable<Array<IGLProperty>>;
    sampleAudio(): void;
}
