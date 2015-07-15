varying float pointSize;
varying float hue;

void main() {
  vec3 color = hsv2rgb(vec3(hue, 1.0, 1.0 ));
  color = color * (1.0 - length(gl_PointCoord - vec2(0.5)) * 2.0);

  gl_FragColor= vec4(color, 1.0);
}
