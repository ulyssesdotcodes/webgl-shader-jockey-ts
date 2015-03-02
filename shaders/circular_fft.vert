uniform sampler2D audioTexture;
uniform float time;

attribute vec3 position;

void main() {
	gl_Position = vec4(position, 1.0);
}
