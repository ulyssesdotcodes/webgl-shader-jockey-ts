QUnit.module("connectedTests");
test("Applied uniforms", function () {
    var audioManager = new AudioManager(new AudioContext());
    var uniformsManager = new UniformsManager([
        audioManager
    ]);
    var observer = new Rx.TestScheduler().createObserver();
    Rx.Observable.combineLatest(Rx.Observable.just(new THREE.ShaderMaterial), uniformsManager.UniformsObservable, function (shader, uniforms) {
        shader.uniforms = uniforms;
        return shader;
    }).map(function (shader) {
        return new ShaderPlane(shader);
    }).map(function (shaderPlane) {
        return shaderPlane.mesh;
    }).subscribe(observer);
    audioManager.sampleAudio();
    var time = audioManager.context.currentTime;
    var finalMaterial = TestUtils.getMessageValue(observer, 0).material;
    equal(typeof finalMaterial, THREE.ShaderMaterial, "Is shader");
    equal(finalMaterial.uniforms.time.value, time, "Create a mesh with time variable");
});
test("Updated uniforms", function () {
    var audioManager = new AudioManager(new AudioContext());
    var uniformsManager = new UniformsManager([
        audioManager
    ]);
    audioManager.sampleAudio();
    var time = audioManager.context.currentTime;
    var observer = new Rx.TestScheduler().createObserver();
    Rx.Observable.combineLatest(Rx.Observable.just(new THREE.ShaderMaterial), uniformsManager.UniformsObservable, function (shader, uniforms) {
        shader.uniforms = uniforms;
        return shader;
    }).map(function (shader) {
        return new ShaderPlane(shader).mesh;
    }).subscribe(observer);
    equal(TestUtils.getMessageValue(observer, 0).material.uniforms.time.value, time, "Initial time value");
    audioManager.sampleAudio();
    time = audioManager.context.currentTime;
    equal(TestUtils.getMessageValue(observer, 0).material.uniforms.time.value, time, "Update time value.");
});
