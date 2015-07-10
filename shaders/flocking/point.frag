varying vec3 vPosition;

void main() {
  vec3 color = vec3(1.0) * (vPosition.z) / 64.0;
  color = color * length(gl_PointCoord);
  gl_FragColor= vec4(1.0, 1.0, 1.0, 1.0);
}
