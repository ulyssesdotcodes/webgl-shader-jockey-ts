/// <reference path='../Controllers/ShadersController'/>

class ShadersView {
  private _shadersController: ShadersController;

  constructor(shadersController: ShadersController) {
    this._shadersController = shadersController;
  }

  render(el: HTMLElement): void {
    var container: JQuery = $("<div>", { class: "shaders" });

    // Select for all of the shaders
    var select: JQuery = $("<select />");

    select.change((__) =>
      this._shadersController.onShaderName(select.find('option:selected').val()));

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
      this._shadersController.onAutoplayChanged(autoplay.val());
    });

    this._shadersController.currentShaderObservable().subscribe((ind) => {
      select.children().eq(ind).prop('selected', true);
    })

    autoplay.prepend(input);

    container.append(autoplay);

    $(el).append(container);
  }
}
