#define TOUCH_EVENT_COUNT 10
precision highp float;
uniform vec3 te[TOUCH_EVENT_COUNT];
uniform vec3 colormod;

void main() {
  vec2 vUv = gl_FragCoord.xy / resolution.xy;
	float fft = texture2D(audioTexture, vec2(vUv.x, 0.25)).r;
  float visibility = ceil(fft - vUv.y);
  vec3 freq = vec3(visibility);

	gl_FragColor = vec4(freq * color, 1.0);
}
