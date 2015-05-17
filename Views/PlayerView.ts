class PlayerView implements IControllerView {
  private content: JQuery;
  private playerController: PlayerController;
  private audioPlayer: HTMLMediaElement;

  constructor(playerController: PlayerController) {
    this.content = $("<div>", { class:"controls audio-controls" });
    this.playerController = playerController;
  }

  render(el: HTMLElement): void {
    this.audioPlayer = document.createElement("audio");
    this.audioPlayer.setAttribute("class", "audio-player");
    this.audioPlayer.controls = true;
    this.audioPlayer.autoplay = true;

    this.playerController.getUrlObservable().subscribe((url) => {
      this.audioPlayer.setAttribute("src", url);
      this.audioPlayer.play();
    });

    window.addEventListener('load', e => {
      this.playerController.setPlayerSource(this.audioPlayer);
    }, false);

    this.content.append(this.audioPlayer);

    $(el).append(this.content);
  }
}
