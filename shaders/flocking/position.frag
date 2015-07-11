void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 tmpPos = texture2D(texturePosition, uv);
  vec3 position = tmpPos.xyz;
  vec4 velocity = texture2D(textureVelocity, uv);

  float hue = tmpPos.w;
  float hueVelocity = velocity.w;

  gl_FragColor = vec4(position + velocity.xyz * delta * 15.0, hueVelocity);
}
