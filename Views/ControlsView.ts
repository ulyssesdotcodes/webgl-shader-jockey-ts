class ControlsView {
  private _controlsController: ControlsController;

  constructor(controller: ControlsController) {
    this._controlsController = controller;
  }

  render(el: HTMLElement): void {
    var container: JQuery = $("<div>", { class: "controls" });

    var volumeSlider: JQuery = $("<input>", { type: "range", min: 0, max: 2.0, step: 0.05});

    volumeSlider.on('input', (__) => {
      this._controlsController.onVolumeChange(volumeSlider.val());
    });

    container.append(volumeSlider);

    $(el).append(container);
  }
}
