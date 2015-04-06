class ControlsView {
  private _controlsController: ControlsController;

  constructor(controller: ControlsController) {
    this._controlsController = controller;
  }

  render(el: HTMLElement): void {
    var container: JQuery = $("<div>", { class: "controls" });

    this.renderVolume(container);
    this.renderHue(container);

    $(el).append(container);
  }

  renderVolume(container: JQuery): void {
    var volumeContainer: JQuery = $("<div>");
    volumeContainer.append("Volume: ");
    var volumeSlider: JQuery = $("<input>", { type: "range", min: 0, max: 2.0, step: 0.05});

    volumeSlider.on('input', (__) => {
      this._controlsController.onVolumeChange(volumeSlider.val());
    });

    volumeContainer.append(volumeSlider);
    container.append(volumeContainer);
  }

  renderHue(container: JQuery): void {
    var hueContainer = $("<div>");
    hueContainer.append("Hue: ");
    var hueSlider: JQuery = $("<input>", { type: "range", min: -0.5, max: 0.5, step: 0.05});

    hueSlider.on('input', (__) => {
      this._controlsController.onHueShiftChange(hueSlider.val());
    });

    hueContainer.append(hueSlider);
    container.append(hueContainer);
  }
}
