varying vec3 vColor;

void main() {
  float loudness = 128.0;
  float r = eqs.r * loudness / pow(length(position - eq1), power);
  float g = eqs.g * loudness / pow(length(position - eq2), power);
  float b = eqs.b * loudness / pow(length(position - eq3), power);
  vColor = vec3(r, g, b);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * size, 1.0);
}
