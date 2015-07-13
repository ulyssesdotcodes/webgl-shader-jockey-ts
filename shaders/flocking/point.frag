varying vec3 vPosition;
varying float hue;

void main() {
  vec3 color = hsv2rgb(vec3(hue, 1.0, 1.0 ));
  color = color * length(gl_PointCoord);

  gl_FragColor= vec4(color, 1.0);
}
