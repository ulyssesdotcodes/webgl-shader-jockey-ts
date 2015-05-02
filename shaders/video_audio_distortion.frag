float quadrant(float coord) {
	coord = sign(coord);
	return -1.0 * sign(coord * (coord - 1.0)) * 3.1415;
}

void main(void)
{
	vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 audioUv = abs(2.0*(uv-0.5));

  float scaledResolution = 0.33;

  vec4 t1 = texture2D(audioTexture, vec2(audioUv[0] * scaledResolution, 0.1));
  vec4 t2 = texture2D(audioTexture, vec2(audioUv[1] * scaledResolution, 0.1));

  float fft = t1[0] * t2[0];

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

	r = r - fft * 0.2;

	uv = vec2(r * cos(a), r * sin(a)) + vec2(0.5);

  vec4 cam = texture2D(camera, uv);

  gl_FragColor = applyHueShift(applyHueShift(cam), bashHue(time).r);
}
