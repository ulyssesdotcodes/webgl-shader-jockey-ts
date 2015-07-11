varying vec3 vPosition;
varying float hue;

void main() {
	vec4 pos = texture2D(texturePosition, reference);
	hue = pos.w;
	vPosition = pos.xyz;
	gl_PointSize = 5.0;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
}
