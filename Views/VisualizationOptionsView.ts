/// <reference path="../Controllers/VisualizationOptionsController"/>

class VisualizationOptionsView {
  private _shadersController: VisualizationOptionsController;

  constructor(shadersController: VisualizationOptionsController) {
    this._shadersController = shadersController;
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

    $(el).append(container);
  }
}
