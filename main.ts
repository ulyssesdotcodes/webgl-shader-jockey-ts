/// <reference path="./typed/jquery.d.ts"/>
/// <reference path="./typed/rx.d.ts"/>
/// <reference path="./typed/waa.d.ts"/>
/// <reference path="./typed/soundcloud.d.ts"/>
/// <reference path="Views/AppView.ts"/>

function exec(): void {
  "use strict";
  var app: AppView = new AppView();
  app.render($("#content")[0]);
}

$(document).ready(function() {
  exec();
});
