/// <reference path="./TestUtils.ts"/>
/// <reference path="../typed/qunit.d.ts"/>
/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/rx.testing.d.ts"/>
/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/ShaderManager.ts"/>
QUnit.module("shaderCreator");
window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
var audioManager = new AudioManager(new AudioContext());
var shaderMaterial = new THREE.ShaderMaterial();
var shaderProvider = {
    shaderObservable: function () {
        return Rx.Observable.just(shaderMaterial);
    }
};
var shaderCreator = new ShaderManager([audioManager]);
test("Apply uniforms", function () {
    var scheduler = new Rx.TestScheduler();
    var observer = scheduler.createObserver();
    audioManager.sampleAudio();
    var time = audioManager.context.currentTime;
    shaderProvider.shaderObservable().map(function (shader) { return shaderCreator.applyUniforms(shader); }).subscribe(observer);
    equal(TestUtils.getMessageValue(observer, 0).uniforms.time.type, "f", "Time is float value");
    equal(TestUtils.getMessageValue(observer, 0).uniforms.time.value, time, "Time is correct");
});
//# sourceMappingURL=shadercreator.tests.js.map