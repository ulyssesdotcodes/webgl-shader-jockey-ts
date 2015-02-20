/// <reference path="../Models/AudioManager.d.ts" />
/// <reference path="../Models/Microphone.d.ts" />
/// <reference path="../Models/SoundCloudLoader.d.ts" />
declare class PlayerController {
    private playerSource;
    private manager;
    private microphone;
    private soundCloudLoader;
    constructor();
    onMicClick(): void;
    onUrl(url: string): void;
    setPlayerSource(source: HTMLMediaElement): void;
    sampleAudio(): void;
    getUrlObservable(): Rx.Observable<string>;
}
