uniform sampler2D camera;
uniform vec2 resolution;
uniform float audioResolution;
uniform sampler2D audioTexture;

void main(void)
{
	vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 audioUv = abs(2.0*(uv-0.5));

  float scaledResolution = 0.33;

  vec4 t1 = texture2D(audioTexture, vec2(audioUv[0] * scaledResolution, 0.1));
  vec4 t2 = texture2D(audioTexture, vec2(audioUv[1] * scaledResolution, 0.1));

  float fft = t1[0] * t2[0];

	float offsetMult = sin(uv.x * 10.0);

	float offset = uv.y + fft * 0.3 * offsetMult;
	float offsetY = mod(uv.y + offset, 1.0);

  vec4 cam = texture2D(camera, vec2(uv.x, offsetY));

  // reverse cam
  vec4 diff = vec4(1.0) - cam;

  gl_FragColor = cam;

}
