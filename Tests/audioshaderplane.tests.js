QUnit.module("audioShaderPlane");
var fragmentShader = "f";
test("Plane Geometry Creation", function () {
    var audioManager = new AudioManager(new AudioContext());
    var shaderPlane = new AudioShaderPlane(audioManager);
    var observer = new Rx.TestScheduler().createObserver();
    shaderPlane.MeshObservable.subscribe(observer);
    shaderPlane.onShader(new THREE.ShaderMaterial({ fragmentShader: fragmentShader }));
    audioManager.sampleAudio();
    var time = audioManager.context.currentTime;
    equal(TestUtils.getMessageValue(observer, 0).mesh.material.uniforms.time.value, time, "Time is set");
    equal(TestUtils.getMessageValue(observer, 0).mesh.material.fragmentShader, fragmentShader, "Time is updated");
    audioManager.sampleAudio();
    var time = audioManager.context.currentTime;
    equal(TestUtils.getMessageValue(observer, 0).mesh.material.uniforms.time.value, time, "Time is updated");
    shaderPlane.onShader(new THREE.ShaderMaterial({ fragmentShader: fragmentShader + "2" }));
    equal(TestUtils.getMessageValue(observer, 1).mesh.material.fragmentShader, fragmentShader + "2", "Shader is updated");
    equal(TestUtils.getMessageValue(observer, 1).mesh.material.uniforms.time.value, time, "Uniforms are persisted");
});
