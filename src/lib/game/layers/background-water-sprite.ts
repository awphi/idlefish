import * as PIXI from "pixi.js";
import waterShaderSrc from "../shaders/water-frag.glsl?raw";

export function makeBackgroundWaterSprite(
  app: PIXI.Application,
  uniforms: PIXI.utils.Dict<any>
): PIXI.Sprite {
  const waterShader = new PIXI.Filter(null, waterShaderSrc, uniforms);
  const bgSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  bgSprite.interactive = true;
  bgSprite.filters = [waterShader];

  // rgb(93, 173, 226) - nice blue
  bgSprite.tint = 0x5dade2;
  bgSprite.width = app.view.width;
  bgSprite.height = app.view.height;

  app.ticker.add(() => {
    bgSprite.width = app.view.width;
    bgSprite.height = app.view.height;
  });

  return bgSprite;
}
