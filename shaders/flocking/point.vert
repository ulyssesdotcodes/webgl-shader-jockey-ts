void main() {
	vec4 pos = texture2D(texturePosition, reference);
	gl_PointSize = 5.0;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
}
