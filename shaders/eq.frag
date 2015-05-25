void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  float l = 0.0;
  float partition = 0.0;
  if (uv.x > 0.5 && uv.y < 0.5) {
    partition = 1.0;
  }
  else if (uv.x < 0.5 && uv.y > 0.5) {
    partition = 2.0;
  }
  else if (uv.x > 0.5 && uv.y > 0.5) {
    partition = 3.0;
  }

  float section = 128.0;
  float validArea = section * 4.0;
  for(float i=0.0;i < 128.0;i++) {
    float absI = i + section * partition;
    float val = texture2D(audioTexture, vec2(absI / 1024.0, 0.25)).r;
    l += val * val / (1.0 - ((1.0 - val) * absI / (section * 4.0)));
  }

  l = l / section;

  gl_FragColor = vec4(l);
}
