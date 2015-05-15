/// <reference path="./TestUtils.ts"/>
/// <reference path="../typed/qunit.d.ts"/>
/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/rx.testing.d.ts"/>
/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/UniformsManager.ts"/>
QUnit.module("shaderCreator");
window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
var audioManager = new AudioManager(new AudioContext());
var shaderMaterial = new THREE.ShaderMaterial();
var shaderProvider = {
    shaderObservable: function () {
        return Rx.Observable.just(shaderMaterial);
    }
};
var uniformsManager = new UniformsManager([audioManager]);
test("Apply uniforms", function () {
    var scheduler = new Rx.TestScheduler();
    var observer = scheduler.createObserver();
    audioManager.sampleAudio();
    var time = audioManager.context.currentTime;
    Rx.Observable.combineLatest(shaderProvider.shaderObservable(), uniformsManager.UniformsObservable, function (shader, uniforms) { return shader.uniforms = uniforms; });
    equal(TestUtils.getMessageValue(observer, 0).uniforms.time.type, "f", "Time is float value");
    equal(TestUtils.getMessageValue(observer, 0).uniforms.time.value, time, "Time is correct");
});
