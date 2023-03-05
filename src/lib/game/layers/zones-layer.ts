import * as PIXI from "pixi.js";
import type { Zone } from "../zones";

export function makeZoneLayer(): {
  container: PIXI.Container;
  refresh: (zones: IterableIterator<Zone>) => void;
} {
  const container = new PIXI.Container();
  const texts = new Set<PIXI.Text>();
  const g = new PIXI.Graphics();
  container.addChild(g);

  function drawZone(zone: Zone) {
    g.lineStyle(8, zone.color, 0.3);
    g.beginFill(zone.color, 0.1);
    g.drawCircle(zone.circle.x, zone.circle.y, zone.circle.radius);

    g.endFill();

    const text = new PIXI.Text(zone.text, {
      fill: zone.color,
      fontSize: zone.circle.radius / 8,
      fontFamily: "Alagard",
    });
    text.position.set(
      zone.circle.x - text.width / 2,
      zone.circle.y - text.height / 2
    );
    texts.add(text);
    container.addChild(text);
  }

  return {
    container,
    refresh(zones: IterableIterator<Zone>) {
      g.clear();
      texts.forEach((a) => {
        a.removeFromParent();
        a.destroy();
      });
      texts.clear();

      for (const zone of zones) {
        drawZone(zone);
      }
    },
  };
}
