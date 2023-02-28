import type { Boat } from "./boat";
import * as PIXI from "pixi.js";
import type { Events } from "./events";

export class Interactions {
  private _selectedBoat: Boat | null = null;
  private _isDragPathValid: boolean = false;
  private _mousePos: PIXI.Point = new PIXI.Point();

  public get mousePos(): PIXI.Point {
    return this._mousePos;
  }

  public get isDragPathValid(): boolean {
    return this._isDragPathValid;
  }

  public get selectedBoat(): Boat | null {
    return this._selectedBoat;
  }

  constructor(
    app: PIXI.Application,
    events: Events,
    boats: Map<PIXI.Container, Boat>
  ) {
    app.stage.on("pointerdown", (e) => {
      if (e.button !== 0) {
        return;
      }

      if (e.target instanceof PIXI.Container && boats.has(e.target)) {
        const boat = boats.get(e.target)!;
        this._selectedBoat = boat;
      } else {
        this._selectedBoat = null;
      }
    });

    app.stage.on("pointermove", (e) => {
      if (e.target instanceof PIXI.DisplayObject) {
        e.target.toLocal({ x: e.x, y: e.y }, app.stage, this._mousePos);
        this._isDragPathValid =
          this._selectedBoat !== null &&
          e.target !== this._selectedBoat.container;
      }
    });

    app.stage.on("pointerup", (e) => {
      if (e.button !== 0) {
        return;
      }

      if (e.target instanceof PIXI.Container && boats.has(e.target)) {
        events.fire("select", "boat", boats.get(e.target));
      }

      if (this._selectedBoat !== null) {
        if (this.isDragPathValid) {
          this._selectedBoat.moveTo(this.mousePos.x, this.mousePos.y);
        }
        this._selectedBoat = null;
      } else {
        events.fire("select", null);
      }
    });
  }

  public clearDrag(): void {
    this._selectedBoat = null;
  }
}
