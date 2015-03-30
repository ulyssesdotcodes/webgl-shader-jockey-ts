uniform vec2 resolution;
uniform float accumulatedLoudness;
uniform float time;

// p is a polar coordinate with (radians, distance)
vec2 toCartesian(vec2 p) {
  return vec2(p.y * cos(p.x), p.y * sin(p.x));
}

vec2 toPolar(vec2 p) {
  vec2 cuv = p - vec2(0.5);

  float ca = atan(cuv.x, cuv.y) + radians(90.0);
  float cr = length(cuv);

  return vec2(ca, cr);
}

vec2 closestPoint(vec2 uv, float r) {
  vec2 C = vec2(0.5, 0.5);
  vec2 V = uv - C;

  vec2 closest = C + V * r/ length(V);

  return closest;
}

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
