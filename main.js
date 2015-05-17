/// <reference path="./typed/jquery.d.ts"/>
/// <reference path="./typed/rx.d.ts"/>
/// <reference path="./typed/waa.d.ts"/>
/// <reference path="./typed/soundcloud.d.ts"/>
/// <reference path="./Views/Visualizer.ts"/>
function exec() {
  "use strict";
  var app = new Visualizer([
    '.ignored/dont_know_where_im_going.mp3',
    '.ignored/learning_to_love.mp3',
    '.ignored/test_song.mp3'
  ]);
  app.render($("#content")[0]);
}
$(document).ready(function() {
  exec();
});
