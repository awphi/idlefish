import * as PIXI from "pixi.js";
import type { Boat } from "../boat";

export interface BoatTextLayer {
  container: PIXI.Container;
  drawText: (boat: Boat, text: string, fill: number) => void;
}

export function makeBoatTextLayer(app: PIXI.Application): BoatTextLayer {
  const container = new PIXI.Container();
  const activeTexts: Set<PIXI.Text> = new Set();

  app.ticker.add(() => {
    for (const t of activeTexts) {
      t.y -= 0.6;
      t.alpha -= 0.0035;
      if (t.alpha <= 0) {
        activeTexts.delete(t);
        container.removeChild(t);
        t.destroy();
      }
    }
  });

  // TODO this could be more advanced
  // e.g. per boat queue, non-linear alpha/y-position easing
  return {
    container,
    drawText: (boat, text, fill) => {
      const pixiText = new PIXI.Text(text, {
        fill,
        fontFamily: "Alagard",
        fontSize: 14,
        dropShadow: true,
        dropShadowColor: "black",
        dropShadowDistance: 2,
        dropShadowAngle: Math.PI / 4,
      });
      pixiText.pivot.set(pixiText.width * 0.5, pixiText.height * 0.5);
      pixiText.position.copyFrom(boat.container.position);
      container.addChild(pixiText);
      activeTexts.add(pixiText);
    },
  };
}
