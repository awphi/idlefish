import type * as PIXI from "pixi.js";
import { Howl, Howler } from "howler";
import { makeFishFactory } from "./fish";
import type { Boat } from "./boat";

export type FishingStatus = "out" | "in";

export interface FishingLineState {
  status: FishingStatus;
  dirty: boolean;
}

export class Fisher {
  private _app: PIXI.Application;
  private _nextLineStatus: FishingStatus | null = null;
  private _nextLineTime: number | null = null;
  private _boat: Boat;
  private _fishingInterval: number = -1;

  private _soundEffects = new Howl({
    src: ["sounds/fisher_effects.mp3"],
    sprite: {
      in: [230, 530],
      out: [0, 230],
    },
    // Prevents sounds stacking up before user interacts with the page
    onunlock: () => {
      this._soundEffects.stop();
    },
  });

  // Fish factories
  private _defaultFishFactory = makeFishFactory();

  private _lineState: FishingLineState = {
    status: "in",
    dirty: true,
  };

  public get lineState(): FishingLineState {
    return this._lineState;
  }

  constructor(boat: Boat, app: PIXI.Application) {
    this._app = app;
    this._boat = boat;

    this._app.ticker.add(() => {
      if (
        this._nextLineTime !== null &&
        this._app.ticker.lastTime >= this._nextLineTime
      ) {
        this.setLineStatus(this._nextLineStatus);
        this._nextLineTime = null;
        this._nextLineStatus = null;
      }
    });

    // Measured in fish/second
    // TODO make this (and other stats) affected by fisher quality, gear etc.
    const fishingRate = 0.2;
    // how many ms between reeling in and recasting
    const recastTime = 1000;

    // Fish catching interval
    this._fishingInterval = window.setInterval(() => {
      if (Math.random() < fishingRate / 10) {
        if (this.lineState.status === "out") {
          this.setLineStatus("in");
          this.setLineStatus("out", recastTime);
          const fish = this._defaultFishFactory();
          boat.addFish(fish);
        }
      }
    }, 100);
  }

  public destroy(): void {
    window.clearInterval(this._fishingInterval);
  }

  public setLineStatus(status: FishingStatus, delay: number = 0): void {
    // Don't cast out if boat is full of fish
    if (status === "out" && this._boat.isInventoryFull()) {
      return;
    }

    if (delay <= 0) {
      if (status !== this._lineState.status) {
        this._lineState.status = status;
        this._soundEffects.play(status);
        this._lineState.dirty = true;
      }
    } else {
      this._nextLineStatus = status;
      this._nextLineTime = this._app.ticker.lastTime + delay;
    }
  }
}
