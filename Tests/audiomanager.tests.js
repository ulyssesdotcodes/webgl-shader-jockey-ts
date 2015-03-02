QUnit.module("audioManger");
window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
var audioManager = new AudioManager(new AudioContext());
test("Update source node", function () {
    var source = audioManager.context.createOscillator();
    audioManager.updateSourceNode(source);
    equal(1, audioManager.context.destination.numberOfInputs, "destination should have input");
});
test("Time property", function () {
    var scheduler = new Rx.TestScheduler();
    var mockObserver = scheduler.createObserver();
    audioManager.glProperties().subscribe(mockObserver);
    var time = audioManager.context.currentTime;
    audioManager.sampleAudio();
    notEqual(0, mockObserver.messages.length);
    equal(mockObserver.messages[0].value.value[0].getName(), "time", "A property named time");
    equal(mockObserver.messages[0].value.value[0].addToGL(new Object()).time.value, time, "Corrent time value");
});
