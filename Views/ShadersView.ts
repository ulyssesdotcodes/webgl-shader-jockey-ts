/// <reference path='../Controllers/ShadersController'/>

class ShadersView {
  static shaders = ["simple",  "fft_matrix_product", "circular_fft", "vertical_wav", "threejs_test"];

  private _shadersController: ShadersController;

  private content: JQuery;
  constructor(shadersController: ShadersController) {
    this.content = $("<div>", { class: "queue" })
    this._shadersController = shadersController;
  }

  render(el: HTMLElement): void {
    var container: JQuery = $("<div>", { class: "shaders" });

    var select: JQuery = $("<select />");

    select.change((__) =>
      this._shadersController.onShaderName(select.find('option:selected').val()));

    ShadersView.shaders.forEach((shaderName) =>
      select.append("<option value=\"" + shaderName + "\">" + shaderName + "</option>"));

    container.append(select);

    $(el).append(container);
  }
}
