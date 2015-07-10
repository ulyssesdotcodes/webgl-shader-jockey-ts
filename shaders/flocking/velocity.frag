const float PI = 3.141592654;
const float PI_2 = PI * 2.0;

const float WIDTH = 64.0;

float zoneRadius = 50.0;
float zoneRadiusSquared = zoneRadius * zoneRadius;

float separationThresh = 0.45;
float alignmentThresh = 0.65;

const float UPPER_BOUNDS = 400.0;
const float LOWER_BOUNDS = -UPPER_BOUNDS;

const float SPEED_LIMIT = 3.0;

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 432758.5453);
}

void main() {
  zoneRadius = separationDistance + alignmentDistance + cohesionDistance;
  separationThresh = separationDistance / zoneRadius;
  alignmentThresh = (separationDistance + alignmentDistance) / zoneRadius;
  zoneRadiusSquared = zoneRadius * zoneRadius;

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pointPosition, pointVelocity;

  vec3 selfPosition = texture2D(texturePosition, uv).xyz;
  vec3 selfVelocity = texture2D(textureVelocity, uv).xyz;

  float dist;
  vec3 dir;
  float distSquared;

  float separationSquared = separationDistance * separationDistance;
  float cohesionSquared = cohesionDistance * cohesionDistance;

  float f;
  float percent;

  float limit = SPEED_LIMIT;

  vec3 velocity = selfVelocity;

  //TODO: Predator

  vec3 central = vec3(0.0, 0.0, 0.0);
  dir = selfPosition - central;
  dist = length(dir);
  distSquared = dist * dist;

  if(dist > 64.0){
    velocity -= normalize(dir) * delta * dist * 5.0;
  }

  for(float y=0.0; y < WIDTH; y++) {
    for(float x = 0.0; x < WIDTH; x++){
      if(x == gl_FragCoord.x && y == gl_FragCoord.y) {
        continue;
      }

      pointPosition = texture2D(texturePosition, vec2(x / resolution.x, y / resolution.y)).xyz;
      dir = pointPosition - selfPosition;
      dist = length(dir);
      distSquared = dist * dist;

      if(dist > 0.0 && distSquared < zoneRadiusSquared) {
        percent = distSquared / zoneRadiusSquared;

        if(percent < separationThresh) {
          // Separate
          f = (separationThresh / percent - 1.0) * delta;
          velocity -= normalize(dir) * f;
        }
        else if (percent < alignmentThresh){
          // Align
          float threshDelta = alignmentThresh - separationThresh;
          float adjustedPercent = (percent - separationThresh) / threshDelta;

          pointVelocity = texture2D(textureVelocity,
            vec2(x / resolution.x, y / resolution.y)).xyz;
          f = (0.5 - cos(adjustedPercent * PI_2) * 0.5 + 0.5) * delta;
          velocity += normalize(pointVelocity) * f;
        }
        else {
          // Cohese
          float threshDelta = 1.0 - alignmentThresh;
          float adjustedPercent = (percent - alignmentThresh) / threshDelta;
          f  = (0.5 - cos(adjustedPercent * PI_2) * -0.5 + 0.5) * delta;
          velocity += normalize(dir) * f;
        }
      }

    }

  }

  if(length(velocity) > limit) {
    velocity = normalize(velocity) * limit;
  }

  gl_FragColor = vec4(velocity, 1.0);
}
