uniform vec2 resolution;
uniform float time;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  float sinTime = sin(time);

  vec4 unmodifiedColor = vec4(uv.x, uv.y, 0.0, 1.0);

  vec4 modifiedColor = sinTime * unmodifiedColor;

  gl_FragColor = modifiedColor;
}
