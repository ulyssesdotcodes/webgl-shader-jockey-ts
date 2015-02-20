/// <reference path="PlayerView.d.ts" />
/// <reference path="../Controllers/PlayerController.d.ts" />
declare class AppView implements IControllerView {
    private _playerController;
    playerView: PlayerView;
    content: JQuery;
    constructor();
    render(el: HTMLElement): void;
    animate(): void;
}
