import * as PIXI from "pixi.js";
import * as particles from "@pixi/particle-emitter";
import { closeTo } from "./utils";
import type { IPointData } from "pixi.js";
import wakeParticlesEmitterDef from "./particles/wake.json";
import type { BoatDef } from "./boat-def";
import { Fisher, type FishingStatus } from "./fisher";
import type { Fish } from "./fish";
import type { Game } from "./game-controller";

type BoatStatus = "rotating" | "moving" | "idle";

export interface SerializedBoat {
  boatDef: BoatDef;
  inventory: Fish[];
  position: PIXI.IPointData;
  rotation: number;
}

function makeCastDelay(status: FishingStatus): number {
  return status === "out" ? Math.random() * 2000 : Math.random() * 200;
}

export class Boat {
  // Absolute state
  private _boatDef: BoatDef;
  private _inventory: Fish[] = [];

  // Transient state
  private _container: PIXI.Container;
  private _status: BoatStatus = "idle";
  private _fishers: Fisher[];
  private _desiredPosition: PIXI.Point;
  private _desiredRotation: number;
  private _heading: PIXI.Point = new PIXI.Point(0, 0);
  private _wakeEmitters: particles.Emitter[] = [];
  private _game: Game;

  public get status(): BoatStatus {
    return this._status;
  }

  public get fishers(): Fisher[] {
    return this._fishers;
  }

  private set status(s: BoatStatus) {
    if (s !== this._status) {
      this._status = s;
      this.setFishingStatus(s === "idle" ? "out" : "in");
      this.setWakeParticlesShown(s === "moving");
    }
  }

  public get currentDestination(): IPointData {
    return this._desiredPosition;
  }

  public get container(): PIXI.Container {
    return this._container;
  }

  public get boatDef(): BoatDef {
    return this._boatDef;
  }

  public get inventory(): Fish[] {
    return this._inventory;
  }

  // Helper
  public isInventoryFull(): boolean {
    return this._inventory.length >= this.boatDef.fishCapacity;
  }

  public addFish(fish: Fish): boolean {
    let added = false;
    if (!this.isInventoryFull()) {
      this._inventory.push(fish);
      this._game.events.fire("boat-update", this);
      this._game.events.fire("boat-catch", this, fish);
      added = true;
    }

    if (this.isInventoryFull()) {
      // Bring all lines if the ship is full
      this._fishers.forEach((f) => {
        f.setLineStatus("in", makeCastDelay("in"));
      });
    }

    return added;
  }

  public removeFish(fish: Fish, recast = true): boolean {
    const lengthBefore = this._inventory.length;
    this._inventory = this._inventory.filter((a) => a !== fish);
    this._game.events.fire("boat-update", this);

    if (recast) {
      // Re-cast lines
      this._fishers.forEach((f) => {
        f.setLineStatus("out", makeCastDelay("out"));
      });
    }

    return lengthBefore !== this._inventory.length;
  }

  public constructor(game: Game, boatDef: BoatDef) {
    this._game = game;
    this._boatDef = boatDef;
    this._fishers = Array.from(
      { length: boatDef.seats.length },
      () => new Fisher(this, game.app)
    );

    const container = new PIXI.Container();
    this._container = container;
    container.interactive = true;

    this._desiredPosition = new PIXI.Point(container.x, container.y);
    this._desiredRotation = 0;

    PIXI.Assets.load(boatDef.texture).then((tex) => {
      const sprite = new PIXI.Sprite(tex);
      sprite.scale.set(0.25, 0.25);

      this._boatDef.wakeEmitters.forEach(() => {
        const emitter = new particles.Emitter(
          game.waterLayer,
          particles.upgradeConfig(wakeParticlesEmitterDef, [PIXI.Texture.WHITE])
        );

        //emitter.emit = false;
        this._wakeEmitters.push(emitter);
        this.setFishingStatus("out");
      });
      container.addChild(sprite);
      container.pivot.set(container.width / 2, container.height / 2);
      this.updateWakeParticleEmitterPositions();
      this._game.events.fire("boat-update", this);
    });

    game.app.ticker.add((dt) => {
      this.updateWakeParticleEmitterPositions();
      this._wakeEmitters.forEach((e) => e.update(dt * 0.01));
      if (!closeTo(container.rotation, this._desiredRotation)) {
        this.status = "rotating";
        container.rotation +=
          boatDef.turningSpeed *
          dt *
          (this._desiredRotation < container.rotation ? -1 : 1);
      } else {
        if (
          !closeTo(container.x, this._desiredPosition.x, 1) ||
          !closeTo(container.y, this._desiredPosition.y, 1)
        ) {
          this.status = "moving";
          this._game.events.fire("boat-update", this);
          container.x += boatDef.speed * this._heading.x * dt;
          container.y += boatDef.speed * this._heading.y * dt;
        } else {
          this.status = "idle";
        }
        // TODO do some skew fidgeting to make the ship look like it's riding waves
      }
    });
  }

  private setFishingStatus(status: FishingStatus): void {
    this._game.events.fire("boat-update", this);
    this.fishers.forEach((fisher) => {
      fisher.setLineStatus(status, makeCastDelay(status));
    });
  }

  private setWakeParticlesShown(state: boolean): void {
    this._wakeEmitters.forEach((e) => {
      e.emit = state;
    });
  }

  private updateWakeParticleEmitterPositions(): void {
    const point = new PIXI.Point();
    this._wakeEmitters.forEach((e, i) => {
      const [wx, wy] = this._boatDef.wakeEmitters[i];
      const p = {
        x: wx * this.container.width,
        y: wy * this.container.height,
      };
      // This works as wake emitters live on the global stage
      this._game.waterLayer.toLocal(p, this.container, point);
      e.updateSpawnPos(point.x, point.y);
      e.rotate(this.container.rotation);
    });
  }

  public moveTo(x: number, y: number): void {
    this._desiredRotation =
      Math.atan2(y - this._container.y, x - this._container.x) - Math.PI / 2;

    this._desiredPosition.set(x, y);
    this._heading.copyFrom(
      this._desiredPosition.subtract(this._container.position).normalize()
    );
  }

  public setPosition(x: number, y: number): void {
    this._desiredPosition.set(x, y);
    this._container.position.set(x, y);
    this._heading.copyFrom(
      this._desiredPosition.subtract(this._container.position).normalize()
    );
  }

  public destroy(): void {
    this._fishers.forEach((f) => f.destroy());
  }

  public serialize(): SerializedBoat {
    return {
      position: {
        x: this.container.position.x,
        y: this.container.position.y,
      },
      rotation: this.container.rotation,
      boatDef: this.boatDef,
      inventory: this.inventory,
    };
  }
}
