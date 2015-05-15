class PlayerView implements IControllerView {
  private content: JQuery;
  private playerController: PlayerController;
  private audioPlayer: HTMLMediaElement;

  constructor(playerController: PlayerController) {
    this.content = $("<div>", { class:"controls audio-controls" });
    this.playerController = playerController;
  }

  render(el: HTMLElement): void {
    var mic: JQuery = $("<a>", {
      href: "#",
      class: "mic-icon"
    });

    var micIcon: JQuery = $("<img>", {
      src: "./resources/ic_mic_none_white_48dp.png",
      class: "icon"
    });

    mic.append(micIcon);

    mic.click((e) => {
      e.preventDefault();
      this.playerController.onMicClick();
      this.audioPlayer.pause();
    });

    this.audioPlayer = document.createElement("audio");
    this.audioPlayer.setAttribute("class", "audio-player");
    this.audioPlayer.controls = true;
    this.audioPlayer.autoplay = true;

    this.playerController.getUrlObservable().subscribe((url) => {
      console.log(url);
      this.audioPlayer.setAttribute("src", url);
      this.audioPlayer.play();
    });

    window.addEventListener('load', e => { 
      this.playerController.setPlayerSource(this.audioPlayer);
    }, false);

    this.content.append(mic);
    this.content.append(this.audioPlayer);

    $(el).append(this.content);
  }
}
