class PlayerView implements IControllerView {
  render(el: HTMLElement): void {

    var mic: JQuery = $("<a>", {
      href: "#",
      class: "mic"
    });

    var micIcon: JQuery = $("<img>", {
      src: "./resources/ic_mic_none_white_48dp.png"
    });

    mic.append(micIcon);

    mic.click(function(e: JQueryEventObject): void {
      e.preventDefault();
      console.log("Start mic");
    });

    $(el).append(mic);
  }
}
