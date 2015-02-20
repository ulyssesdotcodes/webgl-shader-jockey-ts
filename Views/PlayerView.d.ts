/// <reference path="../Controllers/PlayerController.d.ts" />
declare class PlayerView implements IControllerView {
    private content;
    private playerController;
    private audioPlayer;
    private input;
    constructor(playerController: PlayerController);
    render(el: HTMLElement): void;
}
