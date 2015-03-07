var ShadersView = (function () {
    function ShadersView(shadersController) {
        this.content = $("<div>", { class: "queue" });
        this._shadersController = shadersController;
    }
    ShadersView.prototype.render = function (el) {
        var _this = this;
        var container = $("<div>", { class: "shaders" });
        var select = $("<select />");
        select.change(function (__) { return _this._shadersController.onShaderName(select.find('option:selected').val()); });
        ShadersView.shaders.forEach(function (shaderName) { return select.append("<option value=\"" + shaderName + "\">" + shaderName + "</option>"); });
        container.append(select);
        $(el).append(container);
    };
    ShadersView.shaders = ["simple", "fft_matrix_product", "circular_fft", "vertical_wav", "threejs_test"];
    return ShadersView;
})();
