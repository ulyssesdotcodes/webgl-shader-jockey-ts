/// <reference path="../Controllers/PlayerController.ts"/>

class PlayerView implements IControllerView {
  private content: JQuery;
  private playerController: PlayerController;

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
    });

    var soundcloud =
      $('<div>', { class: 'soundcloud', text: 'Soundcloud URL:' });

    var input = $("<input>", { class: 'soundcloud-input', type: 'text' });

    input.change(function() {
      console.log(input.val())
    });

    soundcloud.append(input);

    var audioPlayer = $("<audio />", {class: 'audio-player', controls: true});

    this.content.append(mic);
    this.content.append(soundcloud);
    this.content.append(audioPlayer);

    $(el).append(this.content);
  }
}
