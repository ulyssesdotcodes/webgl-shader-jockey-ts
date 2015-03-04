/// <reference path="./TestUtils.ts"/>
/// <reference path="../typed/qunit.d.ts"/>
/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/rx.testing.d.ts"/>
/// <reference path="../Models/ShaderPlane.ts"/>
/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/UniformsManager.ts"/>

QUnit.module("connectedTests");

test("Applied uniforms", function () {
  var audioManager = new AudioManager(new AudioContext());
  var uniformsManager = new UniformsManager([audioManager]);

  var observer: Rx.MockObserver<THREE.Mesh> = new Rx.TestScheduler().createObserver();
  Rx.Observable.combineLatest(Rx.Observable.just(new THREE.ShaderMaterial), uniformsManager.UniformsObservable,
    (shader, uniforms) => {
      shader.uniforms = uniforms;
      return shader;
    })
    .map((shader) => new ShaderPlane(shader))
    .map((shaderPlane) => shaderPlane.mesh)
    .subscribe(observer);

  audioManager.sampleAudio();
  var time = audioManager.context.currentTime;

  var finalMaterial: THREE.Material = TestUtils.getMessageValue(observer, 0).material;
  equal(typeof finalMaterial, THREE.ShaderMaterial, "Is shader");
  equal((<THREE.ShaderMaterial>finalMaterial).uniforms.time.value, time, "Create a mesh with time variable");
});

test("Updated uniforms", function () {
  var audioManager = new AudioManager(new AudioContext());
  var uniformsManager = new UniformsManager([audioManager]);

  audioManager.sampleAudio();
  var time = audioManager.context.currentTime;

  var observer: Rx.MockObserver<THREE.Mesh> = new Rx.TestScheduler().createObserver();
  Rx.Observable.combineLatest(Rx.Observable.just(new THREE.ShaderMaterial), uniformsManager.UniformsObservable,
    (shader, uniforms) => {
      shader.uniforms = uniforms;
      return shader;
    })
    .map((shader) => new ShaderPlane(shader).mesh)
    .subscribe(observer);

  equal((<THREE.ShaderMaterial>TestUtils.getMessageValue(observer, 0).material)
    .uniforms.time.value, time, "Initial time value");

  audioManager.sampleAudio();
  time = audioManager.context.currentTime;
  equal((<THREE.ShaderMaterial>TestUtils.getMessageValue(observer, 0).material)
    .uniforms.time.value, time, "Update time value.");
});
