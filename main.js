function exec() {
    "use strict";
    var app = new AppView();
    app.render($("#content")[0]);
}
$(document).ready(function () {
    exec();
});
