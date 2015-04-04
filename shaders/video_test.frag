void main(void)
{
	vec2 uv = gl_FragCoord.xy / resolution.xy;

  gl_FragColor = texture2D(camera, uv);
}
