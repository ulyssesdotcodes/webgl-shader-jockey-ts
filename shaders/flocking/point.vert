varying vec3 vPosition;
varying float hue;

void main() {
	vec4 pos = texture2D(texturePosition, reference);
	hue = pos.w;
	vPosition = pos.xyz;
	vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
	gl_PointSize = 5.0 / length(mvPosition.xyz);
	gl_Position = projectionMatrix * mvPosition;
}
