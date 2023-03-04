import type * as PIXI from "pixi.js";

export interface Zone {
  position: PIXI.IPointData;
  radius: number;
  role: "shop" | "bonus";
  text: string;
  color: number;
}

export interface ShopZone extends Zone {
  role: "shop";
}

export interface BonusZone extends Zone {
  role: "bonus";
  // TODO make bonus zone give some odds object that can be used to make a re-weighted fish factory
  getOdds: () => any;
}
