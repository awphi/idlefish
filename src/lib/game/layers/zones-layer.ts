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
    g.drawCircle(zone.position.x, zone.position.y, zone.radius);

    g.endFill();

    const text = new PIXI.Text(zone.text, {
      fill: zone.color,
      fontSize: zone.radius / 8,
      fontFamily: "Alagard",
    });
    text.position.set(
      zone.position.x - text.width / 2,
      zone.position.y - text.height / 2
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
