void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 tmpPos = texture2D(texturePosition, uv);
  vec3 position = tmpPos.xyz;
  vec4 velocity = texture2D(textureVelocity, uv);

  float hue = tmpPos.w;
  float hueVelocity = velocity.w;

  vec3 finalPos = position + velocity.xyz * delta * 8.0;

  finalPos.x = min(finalPos.x, 256.0);
  finalPos.y = min(finalPos.y, 256.0);
  finalPos.z = min(finalPos.z, 256.0);

  gl_FragColor = vec4(finalPos, hueVelocity);
}
