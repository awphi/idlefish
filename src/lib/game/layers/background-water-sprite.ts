import * as PIXI from "pixi.js";
import waterShaderSrc from "../shaders/water-frag.glsl?raw";
import { worldHeight, worldWidth } from "../utils";

export function makeBackgroundWaterSprite(
  app: PIXI.Application,
  uniforms: PIXI.utils.Dict<any>
): PIXI.Sprite {
  const waterShader = new PIXI.Filter(null, waterShaderSrc, uniforms);
  //waterShader.autoFit = false;
  const bgSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  bgSprite.filters = [waterShader];

  // rgb(93, 173, 226) - nice blue
  bgSprite.tint = 0x5dade2;
  bgSprite.width = worldWidth;
  bgSprite.height = worldHeight;
  return bgSprite;
}
