const float uFreqY = 20.;
const float uFreqX = 10.;
const float uSpeed = 3.;
const float uAmplitude = 0.003;

uniform float time;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
  gl_FragColor = texture2D(uSampler, vTextureCoord + vec2(sin(uFreqY * vTextureCoord.y + uFreqX * vTextureCoord.x + uSpeed * time) * uAmplitude));
}