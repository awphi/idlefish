precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform float maxPixelSize;

vec2 mapCoord(vec2 coord) {
  coord *= filterArea.xy;
  coord += filterArea.zw;

  return coord;
}

vec2 unmapCoord(vec2 coord) {
  coord -= filterArea.zw;
  coord /= filterArea.xy;

  return coord;
}

vec2 pixelate(vec2 coord, vec2 size) {
  return floor(coord / size) * size;
}

void main(void) {
  vec2 coord = mapCoord(vTextureCoord);

  coord = pixelate(coord, vec2(maxPixelSize, maxPixelSize));

  coord = unmapCoord(coord);

  gl_FragColor = texture2D(uSampler, coord);
}