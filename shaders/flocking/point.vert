varying float pointSize;
varying float hue;

void main() {
	vec4 pos = texture2D(texturePosition, reference);
	hue = pos.w;
	vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
	pointSize = 500.0 / length(mvPosition.xyz);
	gl_PointSize = pointSize;
	gl_Position = projectionMatrix * mvPosition;
}
