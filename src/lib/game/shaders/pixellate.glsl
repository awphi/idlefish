precision highp float;

uniform vec4 outputFrame;
uniform sampler2D uSampler;

varying vec2 vTextureCoord;

uniform float maxPixelSize;

void main() {
  vec2 uv = vTextureCoord;

  vec2 pixelSize = 1.0 / (outputFrame.zw / maxPixelSize);

  // add pxResolution / 2 to fix image position.
  vec2 fixedUV = uv + pixelSize / 2.0;

  // Pixelated UV coordinates
  vec2 pxUV = floor(fixedUV / pixelSize) * pixelSize;

  gl_FragColor = texture2D(uSampler, pxUV);
}