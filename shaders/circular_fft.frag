#define TOUCH_EVENT_COUNT 10
precision highp float;
uniform sampler2D audioTexture;
uniform vec2 resolution;
uniform float audioResolution;
uniform float time;
uniform vec3 te[TOUCH_EVENT_COUNT];
uniform vec3 colorMod;

vec4 fromPos(in vec2 uv, in vec3 tuv) {
    // Convert to polar
    vec2 cuv = abs(uv - tuv.xy);
    float a = atan(cuv.x, cuv.y);
    float r = length(cuv);
    
    // FFT
    float fft = texture2D(audioTexture, vec2(r, 0.25)).x;
    
    // Rotating colors
    vec4 base = vec4(uv,0.5+0.5*sin(time),1.0);
    return base * (sin(r * 64.0 * 3.1415 - time ) * fft);
}

void main(void)
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 color = vec4(fromPos(uv, vec3(0.5)).rbg, 1.0);

    for(int i = 0; i < TOUCH_EVENT_COUNT; i++) {
      color = color + fromPos(uv, te[i]);
    }

    gl_FragColor = color * vec4(colorMod * 2.0, 1.0);
}
