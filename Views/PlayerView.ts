class PlayerView implements IControllerView {
  private content: JQuery;
  private playerController: PlayerController;
  private audioPlayer: HTMLMediaElement;
  private input: JQuery;

  constructor(playerController: PlayerController) {
    this.content = $("<div>", { class:"controls" });
    this.playerController = playerController;
  }

  render(el: HTMLElement): void {
    var mic: JQuery = $("<a>", {
      href: "#",
      class: "mic"
    });

    var micIcon: JQuery = $("<img>", {
      src: "./resources/ic_mic_none_white_48dp.png"
    });

    mic.append(micIcon);

    mic.click((e) => {
      e.preventDefault();
      this.playerController.onMicClick();
      this.audioPlayer.pause();
    });

    var soundcloud =
      $('<div>', { class: 'soundcloud', text: 'Soundcloud URL:' });

    this.input = $("<input>", { class: 'soundcloud-input', type: 'text' });

    this.input.change(() => this.playerController.onUrl(this.input.val()));

    soundcloud.append(this.input);

    this.audioPlayer = document.createElement("audio");
    this.audioPlayer.setAttribute('class', 'audio-player');
    this.audioPlayer.controls = true;

    this.playerController.getUrlObservable().subscribe((url) => {
      this.audioPlayer.setAttribute("src", url);
      this.audioPlayer.play();
    });
    this.playerController.setPlayerSource(this.audioPlayer);

    this.content.append(mic);
    this.content.append(soundcloud);
    this.content.append(this.audioPlayer);

    $(el).append(this.content);
  }
}
