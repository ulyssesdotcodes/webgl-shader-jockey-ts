void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float al = (accumulatedLoudness + time / 10.0) / 5.0;

  // float loudness = volume * loudness;

  vec2 z, c;
  c.x = 1.333333 * cos(.25 * al) * 0.5 - 0.5;
  c.y = sin(0.25 * al) * 0.5 - 0.5;

  z = uv * vec2(1.333, 1.0);
  float l = 2.0 * loudness * loudness;
  int iter = 10 + int(100.0 * (-cos(l * 3.1415) + 1.0));
  int endi = iter;
  for(int i=0; i<210; i++) {
    if (i > iter) break;

    float x= (z.x * z.x - z.y * z.y) + c.x;
    float y = (z.y * z.x + z.x * z.y) + c.y;

    if ((x * x + y * y) > 4.0) break;
    z.x = x;
    z.y = y;

    endi = i;
  }

  gl_FragColor = vec4(vec3(endi == iter ? 0.0 : float(endi)/float(iter)), 1.0);
}
