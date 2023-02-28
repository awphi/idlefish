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
  container.addChild(bgSprite);

  function drawWake({ angle, origin, speed }: Wake): void {
    const wakeGraphics = new PIXI.Graphics();
    wakeGraphics.lineStyle(0);
    wakeGraphics.x = origin.x;
    wakeGraphics.y = origin.y;
    wakeGraphics.rotation = angle;

    const wakeLineWidth = 25;
    const wakeTightness = 25 * speed * speed;
    const wakeLength = 100 + speed * 25;

    // Wake body
    wakeGraphics.beginFill(0xffffff, 0.1);
    wakeGraphics.moveTo(0, 0);
    wakeGraphics.lineTo(wakeTightness, wakeLength);
    wakeGraphics.lineTo(wakeTightness + wakeLineWidth, wakeLength);

    wakeGraphics.moveTo(0, 0);
    wakeGraphics.lineTo(-wakeTightness, wakeLength);
    wakeGraphics.lineTo(-wakeTightness - wakeLineWidth, wakeLength);
    wakeGraphics.endFill();

    // DEBUG: Dot on origin
    wakeGraphics.beginFill(0x00ff00, 1);
    wakeGraphics.drawCircle(0, 0, 10);
    wakeGraphics.endFill();

    container.addChild(wakeGraphics);
  }

  /*   drawWake({
    origin: new PIXI.Point(400, 400),
    angle: Math.PI,
    speed: 3,
  });
  drawWake({
    origin: new PIXI.Point(400, 400),
    angle: Math.PI,
    speed: 2.9,
  }); */

  app.ticker.add(() => {
    bgSprite.width = app.view.width;
    bgSprite.height = app.view.height;
  });

  return container;
}
