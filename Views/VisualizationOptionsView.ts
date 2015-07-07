/// <reference path="../Controllers/VisualizationOptionsController"/>

class VisualizationOptionsView {
  private _shadersController: VisualizationOptionsController;
  private _autoplay: boolean;

  constructor(shadersController: VisualizationOptionsController, autoplay: boolean) {
    this._shadersController = shadersController;
    this._autoplay = autoplay;
  }

  render(el: HTMLElement): void {
    var container: JQuery = $("<div>", { class: "shaders" });

    // Select for all of the shaders
    var select: JQuery = $("<select />");

    select.change((__) =>
      this._shadersController.onOptionName(select.find('option:selected').val()));

    this._shadersController.shaderNames().forEach((shaderName) =>
      select.append("<option value=\"" + shaderName + "\">" + shaderName + "</option>"));

    container.append(select);

    if(this._autoplay) {
      // Autoplay to enable autoplay
      var autoplay: JQuery = $("<label>", { text: "Autoplay" });

      var input: JQuery = $("<input/>", {
        type: "checkbox",
        checked: true
      });

      input.change(() => {
        this._shadersController.onAutoplayChanged(input.is(":checked"));
      });

      this._shadersController.currentShaderObservable().subscribe((ind) => {
        select.children().eq(ind).prop('selected', true);
      })

      autoplay.prepend(input);

      container.append(autoplay);
    }
    else {
      this._shadersController.onAutoplayChanged(false);
    }

    $(el).append(container);
  }
}
