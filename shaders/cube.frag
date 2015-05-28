float intersect(vec3 ro, vec3 rd) {
  // w = 1
  // x = -0.5|0.5
  // y = -0.5|0.5
  // z = -0.5|0.5

  return t = -ro.y/rd.y;
	return length(max(vec3(0.0), abs (vec3(t, 0.0, ro.xz + rd.xz * t)));
}

void main() {
	vec3 light = normalize(vec3(0.5666));
	vec2 uv = (-1.0 + 2.0*gl_FragCoord.xy / resolution.xy) * vec2(resolution.x/resolution.y, 1.0);

	vec3 col = vec3(0.0);

	vec3 ro = vec3(0.0, 0.8, -5.0);
	vec3 rd = normalize(vec3(uv, 1.0));

	float t = intersect(ro, rd);

	vec3 pos = ro + t * rd;
	if (t > 0.0) {
			vec3 nml = normalize(vec3(vec2(0.0, 0.0) - pos.xy, 0.0));
		float dif = dot(nml, light);
		col = vec3(nml);
	}

	gl_FragColor = vec4(col, 1.0);
}
