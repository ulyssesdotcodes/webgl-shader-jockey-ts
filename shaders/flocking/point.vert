varying vec3 vPosition;

void main() {
	vec4 pos = texture2D(texturePosition, reference);
	vPosition = pos.xyz;
	gl_PointSize = 5.0;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
}
