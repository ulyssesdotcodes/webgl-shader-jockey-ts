float quadrant(float coord) {
	coord = sign(coord);
	return -1.0 * sign(coord * (coord - 1.0)) * 3.1415;
}

void main(void)
{
	vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 audioUv = abs(2.0*(uv-0.5));

  float scaledResolution = 0.8;


	vec2 cuv = uv - vec2(0.5);
	float offset = 0.0;
	if(cuv.x < 0.0) {
		offset = radians(180.0);
	}
	else if (cuv.y < 0.0) {
		offset = 2.0 * radians(180.0);
	}

	float a = atan(cuv.x, cuv.y) + radians(90.0);
	float r = length(cuv);

  vec4 fft = texture2D(audioTexture, vec2(r * scaledResolution, 0.1)) * volume;

	a = a - fft[0] * 0.8 - loudness * 0.1;

	uv = vec2(r * cos(a), r * sin(a)) + vec2(0.5);

	float camScale = resolution.x / cameraResolution.x;
	float yv = cameraResolution.y * camScale;
	vec2 camuv = vec2(uv.x,
		0.5 * (yv - resolution.y) / yv +
			uv.y * (resolution.y / yv));

  vec4 cam = texture2D(camera, camuv);

  gl_FragColor = applyHueShift(cam, hue);
}
