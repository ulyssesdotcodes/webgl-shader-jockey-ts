/// <reference path="../typed/soundcloud.d.ts" />
declare class SoundCloudLoader {
    private static CLIENT_ID;
    private urlSubject;
    constructor();
    getUrlObservable(): Rx.Observable<string>;
    loadStream(url: string): void;
}
