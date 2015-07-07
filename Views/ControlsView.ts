class ControlsView {
  private _controlsController: ControlsController;

  private _container: JQuery;

  constructor(controller: ControlsController) {
    this._container = $("<div>", { class: "controls shader-controls" });

    this._controlsController = controller;

    this._controlsController.controlsObservable()
      .subscribe((controls) => {
        this._container.empty();

        controls.forEach((control) => this.renderControl(control));
      });
  }

  render(el: HTMLElement): void {
    $(el).append(this._container);
  }

  renderControl(control: Control) {
    var controlContainer: JQuery = $("<div>");
    controlContainer.append(control.name + ": ");
    var controlSlider: JQuery = $("<input>",
    { type: "range", min: control.min, max: control.max, step: 0.0000001});

    controlSlider.on('input', (__) => {
      this._controlsController.onControlChange(control.name, controlSlider.val());
    });

    controlContainer.append(controlSlider);
    this._container.append(controlContainer);
  }
}
