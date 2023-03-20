import * as PIXI from "pixi.js";
import waterShaderSrc from "../shaders/water-frag.glsl?raw";
import { worldHeight, worldWidth } from "../utils";

export function makeWaterLayer(
  uniforms: PIXI.utils.Dict<any>,
  pixellateShader: PIXI.Filter
): PIXI.Container {
  const container = new PIXI.Container();
  const waterShader = new PIXI.Filter(null, waterShaderSrc, uniforms);
  waterShader.autoFit = false;
  waterShader.resolution = 0.1;
  const bgSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  bgSprite.filters = [waterShader, pixellateShader];

  // rgb(93, 173, 226) - nice blue
  bgSprite.tint = 0x5dade2;
  bgSprite.width = worldWidth;
  bgSprite.height = worldHeight;
  container.addChild(bgSprite);
  return container;
}
