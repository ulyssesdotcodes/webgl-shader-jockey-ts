void main(void)
{
  float al = mod(accumulatedLoudness / 10.0, radians(360.0));
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec2 closest = toPolar(closestPoint(uv, 0.2));

  vec2 target = vec2(al, 0.2);

  float l = length(target * resolution.xy - uv * resolution.xy);

  float brightness = 1.0 - l / 10.0;

  gl_FragColor = vec4(vec3(brightness), 1.0);
}
