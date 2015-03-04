uniform vec2 resolution;
uniform float time;

void main(void)
{
  vec2 pos = gl_FragCoord.xy / resolution.xy;
  gl_FragColor = vec4(pos * sin(time * 100.0), 0.0, 1.0);
}
