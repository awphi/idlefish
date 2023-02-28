import * as PIXI from "pixi.js";
import type { Boat } from "../boat";
import type { IPointData } from "pixi.js";
import type { FishingLineState } from "../fisher";

export interface FishingLineLayer {
  graphics: PIXI.Graphics;
  refresh: (boats: IterableIterator<Boat>) => void;
}

export function makeFishingLineLayer(): FishingLineLayer {
  const g = new PIXI.Graphics();
  const linePositions: Map<FishingLineState, IPointData> = new Map();

  function getLinePosition(
    boat: Boat,
    state: FishingLineState,
    seatPos: IPointData
  ): IPointData {
    if (!state.dirty && linePositions.has(state)) {
      return linePositions.get(state);
    }

    state.dirty = false;

    const d = new PIXI.Point(
      seatPos.x - boat.container.x,
      seatPos.y - boat.container.y
    ).normalize();
    const lineLength = 50;
    const lineRandomness = 15;
    const lineRandomnessX = (Math.random() - 0.5) * 2 * lineRandomness;
    const lineRandomnessY = (Math.random() - 0.5) * 2 * lineRandomness;

    const pos = {
      x: seatPos.x + d.x * lineLength + lineRandomnessX,
      y: seatPos.y + d.y * lineLength + lineRandomnessY,
    };

    linePositions.set(state, pos);
    return pos;
  }

  function drawBoatLines(boat: Boat) {
    const seatPos = new PIXI.Point();

    for (let i = 0; i < boat.boatDef.seats.length; i++) {
      const lineState = boat.fishers[i].lineState;

      if (lineState.status === "in") {
        continue;
      }

      const seatPosUV = boat.boatDef.seats[i];

      boat.container.toGlobal(
        {
          x: seatPosUV[0] * boat.container.width,
          y: seatPosUV[1] * boat.container.height,
        },
        seatPos
      );

      const linePos = getLinePosition(boat, lineState, seatPos);
      g.lineStyle(1, 0x000000, 1);
      g.moveTo(seatPos.x, seatPos.y);
      g.lineTo(linePos.x, linePos.y);
    }
  }

  return {
    graphics: g,
    refresh: (boats: IterableIterator<Boat>) => {
      g.clear();
      for (const boat of boats) {
        drawBoatLines(boat);
      }
    },
  };
}
