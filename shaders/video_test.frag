uniform sampler2D camera;
uniform vec2 resolution;

void main(void)
{
	vec2 uv = gl_FragCoord.xy / resolution.xy;

  gl_FragColor = texture2D(camera, uv);
}
