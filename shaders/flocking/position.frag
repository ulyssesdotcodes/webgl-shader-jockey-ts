void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 tmpPos = texture2D(texturePosition, uv);
  vec3 position = tmpPos.xyz;
  vec4 velocity = texture2D(textureVelocity, uv);

  float hue = tmpPos.w;
  float hueVelocity = velocity.w;

  float delt;
  if(delta > 1.0) {
    delt = 1.0;
  }
  else {
    delt = delta;
  }
  vec3 finalPos = position + velocity.xyz * delt * 12.0;

  finalPos.x = min(finalPos.x, 256.0);
  finalPos.y = min(finalPos.y, 256.0);
  finalPos.z = min(finalPos.z, 256.0);

  gl_FragColor = vec4(finalPos, hueVelocity);
}
