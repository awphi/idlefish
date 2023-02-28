import * as PIXI from "pixi.js";
import waterShaderSrc from "./shaders/water-frag.glsl?raw";

// TODO purge this if we're going with particle based wakesw
interface Wake {
  origin: PIXI.Point;
  angle: number;
  speed: number;
}

export function makeWaterLayer(
  app: PIXI.Application,
  uniforms: PIXI.utils.Dict<any>
): PIXI.Container {
  const waterShader = new PIXI.Filter(null, waterShaderSrc, uniforms);
  const container = new PIXI.Container();
  container.interactive = true;
  container.filters = [waterShader];
  const bgSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  // rgb(93, 173, 226) - nice blue
  bgSprite.tint = 0x5dade2;
  bgSprite.width = app.view.width;
  bgSprite.height = app.view.height;
  container.addChild(bgSprite);

  app.ticker.add(() => {
    bgSprite.width = app.view.width;
    bgSprite.height = app.view.height;
  });

  return container;
}
