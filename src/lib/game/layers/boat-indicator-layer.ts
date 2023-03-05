import type { IPointData } from "pixi.js";
import * as PIXI from "pixi.js";
import type { Boat } from "../boat";
import { worldHeight, worldWidth } from "../utils";

export function makeBoatIndicatorLayer(): {
  graphics: PIXI.Graphics;
  refresh: (
    boats: IterableIterator<Boat>,
    draggedBoat: Boat | null,
    mousePos: IPointData
  ) => void;
} {
  const g = new PIXI.Graphics();

  function drawIndicator(boat: Boat, dst: IPointData, color = 0xffffff) {
    g.lineStyle(0);
    g.beginFill(color, 0.5);
    g.drawCircle(dst.x, dst.y, 10);
    g.endFill();

    g.lineStyle(4, color, 0.3);
    g.moveTo(boat.container.x, boat.container.y);
    g.lineTo(dst.x, dst.y);
  }

  g.filterArea = new PIXI.Rectangle(0, 0, worldWidth, worldHeight);

  return {
    graphics: g,
    refresh(
      boats: IterableIterator<Boat>,
      draggedBoat: Boat | null,
      mousePos: IPointData
    ) {
      g.clear();

      if (draggedBoat !== null) {
        drawIndicator(draggedBoat, mousePos);
      }

      for (const boat of boats) {
        if (boat.status !== "idle") {
          drawIndicator(
            boat,
            boat.currentDestination,
            boat === draggedBoat ? 0xff0000 : 0xffffff
          );
        }
      }
    },
  };
}
