/// <reference path="../typed/qunit.d.ts"/>
/// <reference path="../Models/AudioManager.ts"/>

QUnit.module("audioManger");


test("Update source node", function () {
  console.log("Test");
    window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
  var audioManager: AudioManager = new AudioManager(new AudioContext());

  var source: AudioSourceNode = audioManager.context.createOscillator();

  audioManager.updateSourceNode(source);

  equal(1, audioManager.context.destination.numberOfInputs, "destination should have input");
});