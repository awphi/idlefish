precision highp float;

uniform float time;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
  vec4 texture_color = texture2D(uSampler, vTextureCoord); // rgb 93, 173, 226

  vec4 k = vec4(time);
  k.xy = vTextureCoord * 14.0;
  float val1 = length(0.5 - fract(k.xyw *= mat3(vec3(-2.0, -1.0, 0.0), vec3(3.0, -1.0, 1.0), vec3(1.0, -1.0, -1.0)) * 0.5));
  float val2 = length(0.5 - fract(k.xyw *= mat3(vec3(-2.0, -1.0, 0.0), vec3(3.0, -1.0, 1.0), vec3(1.0, -1.0, -1.0)) * 0.2));
  float val3 = length(0.5 - fract(k.xyw *= mat3(vec3(-2.0, -1.0, 0.0), vec3(3.0, -1.0, 1.0), vec3(1.0, -1.0, -1.0)) * 0.5));
  vec4 color = vec4(pow(min(min(val1, val2), val3), 7.0) * 3.0) + texture_color;
  gl_FragColor = color;
}