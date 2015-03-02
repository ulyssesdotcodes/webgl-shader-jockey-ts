/// <reference path="../typed/qunit.d.ts"/>
/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/rx.testing.d.ts"/>
/// <reference path="./TestUtils.ts"/>
/// <reference path="../Models/ShaderLoader.ts"/>
QUnit.module("shaderLoader");
var fragment = "\
#define TOUCH_EVENT_COUNT 10\
precision highp float;\
uniform sampler2D audioTexture;\
uniform float time;\
uniform vec2 resolution;\
uniform vec3 te[TOUCH_EVENT_COUNT];\
uniform vec3 colormod;\
\
void main() {\
  vec2 vUv = gl_FragCoord.xy / resolution.xy;\
	float fft = texture2D(audioTexture, vec2(vUv.x, 0.25)).r;\
  float visibility = ceil(fft - vUv.y);\
  vec4 freq = vec4(visibility, visibility, visibility,1.0);\
\
  for(int i=0;i<TOUCH_EVENT_COUNT;i++) {\
    vec3 tec = te[i];\
\
    if (tec.z == 0.0) {\
      continue;\
    }\
    \
    float distTouch = length(tec.xy - vUv);\
\
    float c = 1.0 - (time - tec.z) / 2.0;\
    if (distTouch < 0.1) {\
      freq = max(freq, vec4(c, c, c, 1.0));\
    }\
  }\
\
	gl_FragColor = freq;\
}\
";
test("Time property", function () {
    var scheduler = new Rx.TestScheduler();
    var mockObserver = scheduler.createObserver();
    ShaderLoader.getShaderFromServer('simple').subscribe(mockObserver);
    equal(TestUtils.getMessageValue(mockObserver, 0).fragmentShader, fragment, "Fragment loaded correctly");
});
//# sourceMappingURL=shaderloader.tests.js.map