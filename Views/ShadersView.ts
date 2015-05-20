/// <reference path='../Controllers/ShadersController'/>

class ShadersView {
  private _shadersController: ShadersController;

  constructor(shadersController: ShadersController) {
    this._shadersController = shadersController;
  }

  render(el: HTMLElement): void {
    var container: JQuery = $("<div>", { class: "shaders" });

    var select: JQuery = $("<select />");

    select.change((__) =>
      this._shadersController.onShaderName(select.find('option:selected').val()));

    this._shadersController.shaderNames().forEach((shaderName) =>
      select.append("<option value=\"" + shaderName + "\">" + shaderName + "</option>"));

    container.append(select);

    $(el).append(container);
  }
}
