QUnit.module("shaderCreator");
window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
var audioManager = new AudioManager(new AudioContext());
var shaderMaterial = new THREE.ShaderMaterial();
var shaderProvider = {
    shaderObservable: function () {
        return Rx.Observable.just(shaderMaterial);
    }
};
var uniformsManager = UniformsManager.fromPropertyProviders([audioManager]);
test("Apply uniforms", function () {
    var scheduler = new Rx.TestScheduler();
    var observer = scheduler.createObserver();
    audioManager.sampleAudio();
    var time = audioManager.context.currentTime;
    shaderProvider.shaderObservable().map(function (shader) { return shader.uniforms = uniformsManager.uniforms; }).subscribe(observer);
    equal(TestUtils.getMessageValue(observer, 0).uniforms.time.type, "f", "Time is float value");
    equal(TestUtils.getMessageValue(observer, 0).uniforms.time.value, time, "Time is correct");
});
