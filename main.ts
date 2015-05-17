/// <reference path="./typed/jquery.d.ts"/>
/// <reference path="./typed/rx.d.ts"/>
/// <reference path="./typed/waa.d.ts"/>
/// <reference path="./typed/soundcloud.d.ts"/>
/// <reference path="./Views/Visualizer.ts"/>
/// <reference path="./Views/FileVisualizer.ts"/>

function exec(): void {
  "use strict";
  var app: FileVisualizer =
    new FileVisualizer([
      'ignored/electronicaftm/01 - C2C - Down The Road.mp3',
      'ignored/electronicaftm/02 - Gramatik - Control Room Before You Feat. ILLUMNTR.mp3',
      '.ignored/learning_to_love.mp3',
      '.ignored/test_song.mp3'
    ]);
  // var app: Visualizer = new Visualizer();
  app.render($("#content")[0]);
}

$(document).ready(function() {
  exec();
});
