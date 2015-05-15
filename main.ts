/// <reference path="./typed/jquery.d.ts"/>
/// <reference path="./typed/rx.d.ts"/>
/// <reference path="./typed/waa.d.ts"/>
/// <reference path="./typed/soundcloud.d.ts"/>
/// <reference path="./Views/Visualizer.ts"/>

function exec(): void {
  "use strict";
  var app: Visualizer = new Visualizer(['.ignored/learning_to_love.mp3', '.ignored/test_song.mp3']);
  app.render($("#content")[0]);
}

$(document).ready(function() {
  exec();
});
