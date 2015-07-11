const float PI = 3.141592654;
const float PI_2 = PI * 2.0;

const float WIDTH = 64.0;

float zoneRadius = 10.0;
float zoneRadiusSquared = zoneRadius * zoneRadius;

float separationThresh = 0.45;
float alignmentThresh = 0.65;

const float UPPER_BOUNDS = 400.0;
const float LOWER_BOUNDS = -UPPER_BOUNDS;

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 432758.5453);
}

void main() {
  float ad = alignmentDistance * loudness;
  zoneRadius = separationDistance + alignmentDistance + cohesionDistance;
  separationThresh = separationDistance / zoneRadius;
  alignmentThresh = (separationDistance + alignmentDistance) / zoneRadius;
  zoneRadiusSquared = zoneRadius * zoneRadius;

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pointPosition, pointVelocity;
  float hueVelocity;

  vec4 selfPosition = texture2D(texturePosition, uv);
  vec4 selfVelocity = texture2D(textureVelocity, uv);

  float dist;
  vec3 dir;
  float distSquared;

  float separationSquared = separationDistance * separationDistance;
  float cohesionSquared = cohesionDistance * cohesionDistance;

  float percent;

  vec3 velocity = selfVelocity.xyz;
  float selfHueVelocity = selfVelocity.w;

  //TODO: Predator

  vec3 central = vec3(0.0, 0.0, 0.0);
  dir = selfPosition.xyz - central;
  dist = length(dir);
  distSquared = dist * dist;

  if(dist > roamingDistance){
    velocity -= normalize(dir) * delta * dist;
  }

  if(dist > roamingDistance * roamingDistance) {
    velocity -= normalize(dir) * delta * dist * dist;
  }

  float zoneCount = 0.0;

  for(float y=0.0; y < WIDTH; y++) {
    for(float x = 0.0; x < WIDTH; x++){
      if(x == gl_FragCoord.x && y == gl_FragCoord.y) {
        continue;
      }

      pointPosition = texture2D(texturePosition, vec2(x / resolution.x, y / resolution.y));
      pointVelocity = texture2D(textureVelocity, vec2(x / resolution.x, y / resolution.y));
      dir = pointPosition.xyz - selfPosition.xyz;
      dist = length(dir);
      distSquared = dist * dist;

      float f = loudness;

      if(dist > 0.0 && distSquared < zoneRadiusSquared) {
        zoneCount++;
        percent = distSquared / zoneRadiusSquared;

        if(percent < separationThresh) {
          // Separate
          f *= (separationThresh / percent - 1.0) * delta;
          velocity -= normalize(dir) * f;
          selfHueVelocity += 0.0;
        }
        else if (percent < alignmentThresh){
          // Align
          float threshDelta = alignmentThresh - separationThresh;
          float adjustedPercent = (percent - separationThresh) / threshDelta;

          f *= (0.5 - cos(adjustedPercent * PI_2) * 0.5 + 0.5) * delta * 0.5;
          velocity += normalize(pointVelocity.xyz) * f;
          selfHueVelocity += 0.33;
        }
        else {
          // Cohese
          float threshDelta = 1.0 - alignmentThresh;
          float adjustedPercent = (percent - alignmentThresh) / threshDelta;
          f  *= (0.5 - cos(adjustedPercent * PI_2) * -0.5 + 0.5) * delta * 0.5;
          velocity += normalize(dir) * f;
          selfHueVelocity += 0.66;
        }
      }

      // hueVelocity = pointVelocity.w;
      //
      // selfHueVelocity += hueVelocity * delta / dist;
    }
  }

  selfHueVelocity /=  zoneCount;

  if(length(velocity) > speed) {
    velocity = normalize(velocity) * speed;
  }

  gl_FragColor = vec4(velocity * (0.9 + 4.0 * loudness * loudness), selfHueVelocity);
}
