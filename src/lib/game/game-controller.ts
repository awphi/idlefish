import * as PIXI from "pixi.js";
import "@pixi/math-extras";
import waterWarpShaderSrc from "./shaders/water-warp-frag.glsl?raw";
import pixellateShaderSrc from "./shaders/pixellate.glsl?raw";
import { makeBackgroundWaterSprite } from "./layers/background-water-sprite";
import { Boat } from "./boat";
import { makeBoatIndicatorLayer } from "./layers/boat-indicator-layer";
import {
  makeFishingLineLayer,
  type FishingLineLayer,
} from "./layers/fishing-line-layer";
import type { BoatDef } from "./boat-def";
import { Interactions } from "./interactions";
import { Events } from "./events";
import {
  makeBoatTextLayer,
  type BoatTextLayer,
} from "./layers/boat-text-layer";
import { worldHeight, worldWidth } from "./utils";
import { makeViewport } from "./viewport";
import type { Viewport } from "pixi-viewport";
import { makeZoneLayer } from "./layers/zones-layer";
import type { Zone } from "./zones";

export class Game {
  private _app: PIXI.Application;
  private _viewport: Viewport;

  private _interactions: Interactions;
  private _events = new Events();

  // Layers are in ascending order
  private _waterLayer = new PIXI.Container();
  private _zoneLayer = makeZoneLayer();
  private _boatIndicationLayer = makeBoatIndicatorLayer();
  private _fishingLineLayer: FishingLineLayer;
  private _boatLayer = new PIXI.Container();
  private _boatTextLayer: BoatTextLayer;

  // State
  private _boats: Map<PIXI.Container, Boat> = new Map();
  private _zones = new Set<Zone>();

  // Shaders and uniforms
  private _globalUniforms = {
    time: 0,
    maxPixelSize: 4,
    glintSize: 70,
  };

  private _waterWarpShader = new PIXI.Filter(
    null,
    waterWarpShaderSrc,
    this._globalUniforms
  );

  private _dynamicPixellateShader = new PIXI.Filter(
    null,
    pixellateShaderSrc,
    this._globalUniforms
  );

  public get interactions(): Interactions {
    return this._interactions;
  }

  public get viewport(): Viewport {
    return this._viewport;
  }

  public get app(): PIXI.Application {
    return this._app;
  }

  public get events(): Events {
    return this._events;
  }

  constructor(parentEl: HTMLElement) {
    this._app = new PIXI.Application();
    this._viewport = makeViewport(this._app, parentEl);
    this._app.stage.addChild(this._viewport);
    this._app.resizeTo = parentEl;

    // Ticker to update global uniforms
    this._app.ticker.add((delta) => {
      this._globalUniforms.maxPixelSize = 4 * this._viewport.scale.x;
      this._globalUniforms.glintSize = 70 / this._viewport.scale.x;
      this._globalUniforms.time += delta * 0.01;
    });

    this._waterLayer.filters = [
      //this._waterWarpShader,
      this._dynamicPixellateShader,
    ];

    this._boatIndicationLayer.graphics.filters = [this._dynamicPixellateShader];

    this._zoneLayer.container.filters = [this._dynamicPixellateShader];

    this._waterLayer.addChild(makeBackgroundWaterSprite(this._globalUniforms));
    this._fishingLineLayer = makeFishingLineLayer(this._viewport);
    this._boatTextLayer = makeBoatTextLayer(this._app);

    this._viewport.addChild(this._waterLayer);
    this._viewport.addChild(this._zoneLayer.container);
    this._viewport.addChild(this._boatIndicationLayer.graphics);
    this._viewport.addChild(this._fishingLineLayer.graphics);
    this._viewport.addChild(this._boatLayer);
    this._viewport.addChild(this._boatTextLayer.container);

    parentEl.appendChild(this._app.view as any);
    this._interactions = new Interactions(this._app, this._events, this._boats);

    this._app.ticker.add(() => {
      this._boatIndicationLayer.refresh(
        this._boats.values(),
        this._interactions.isDragPathValid
          ? this._interactions.selectedBoat
          : null,
        this._interactions.mousePos
      );
      this._fishingLineLayer.refresh(this._boats.values());
    });

    this._events.on("boat-catch", (boat, fish) => {
      this._boatTextLayer.drawText(
        boat,
        "+ " + fish.name,
        PIXI.utils.string2hex(fish.color)
      );
    });

    this.addZone({
      circle: new PIXI.Circle(worldWidth / 2, worldHeight / 2, 500),
      color: 0x229954,
      role: "shop",
      text: "Shop",
    });
  }

  addBoat(
    boatDef: BoatDef,
    pos: PIXI.IPointData = { x: worldWidth / 2, y: worldHeight / 2 }
  ): void {
    const boat = new Boat(this, boatDef);
    this._boats.set(boat.container, boat);
    this._boatLayer.addChild(boat.container);
    boat.setPosition(pos.x, pos.y);
    this._events.fire("boat-add", boat);
  }

  addZone(zone: Zone) {
    this._zones.add(zone);
    this._zoneLayer.refresh(this._zones.values());
  }

  removeZone(zone: Zone) {
    this._zones.delete(zone);
    this._zoneLayer.refresh(this._zones.values());
  }

  getZonesAt(x: number, y: number): Zone[] {
    const result: Zone[] = [];
    this._zones.forEach((z) => {
      if (z.circle.contains(x, y)) {
        result.push(z);
      }
    });

    return result;
  }

  removeBoat(boat: Boat): void {
    // Fire the event before destruction to allow referencing its position etc.
    this._events.fire("boat-remove", boat);
    this._boats.delete(boat.container);
    this._boatLayer.removeChild(boat.container);
    boat.container.destroy();
  }

  destroy() {
    this._app.destroy();
    this._boats.forEach((b) => {
      b.destroy();
    });
  }
}
