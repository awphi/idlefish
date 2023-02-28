import * as PIXI from "pixi.js";
import waterWarpShaderSrc from "./shaders/water-warp-frag.glsl?raw";
import pixellateShaderSrc from "./shaders/pixellate.glsl?raw";
import { makeWaterLayer } from "./water-layer";
import { Boat } from "./boat";
import { makeBoatIndicatorLayer } from "./boat-indicator-layer";
import { makeFishingLineLayer } from "./fishing-line-layer";
import type { BoatDef } from "./boat-def";
import { Interactions } from "./interactions";
import { Events } from "./events";

export class Game {
  private _app: PIXI.Application;

  private _interactions: Interactions;
  private _events = new Events();

  private _waterContainer: PIXI.Container;
  private _boatIndicationLayer = makeBoatIndicatorLayer();
  private _fishingLineLayer = makeFishingLineLayer();
  private _backgroundWater: PIXI.Container;

  private _boats: Map<PIXI.Container, Boat> = new Map();

  // Shaders and uniforms
  private _globalUniforms = {
    time: 0,
  };

  private _waterWarpShader = new PIXI.Filter(
    null,
    waterWarpShaderSrc,
    this._globalUniforms
  );

  private _4xPixellateShader = new PIXI.Filter(null, pixellateShaderSrc, {
    maxPixelSize: 4,
  });

  public get interactions(): Interactions {
    return this._interactions;
  }

  public get events(): Events {
    return this._events;
  }

  constructor(parentEl: HTMLElement) {
    this._app = new PIXI.Application();

    // Ticker to update global uniforms
    this._app.ticker.add((delta) => {
      this._globalUniforms.time += delta * 0.01;
    });

    this._waterContainer = new PIXI.Container();
    this._waterContainer.filters = [
      this._waterWarpShader,
      this._4xPixellateShader,
    ];
    this._app.stage.addChild(this._waterContainer);

    this._app.resizeTo = parentEl;
    this._backgroundWater = makeWaterLayer(this._app, this._globalUniforms);
    this._waterContainer.addChild(this._backgroundWater);
    this._waterContainer.addChild(this._boatIndicationLayer.graphics);
    this._fishingLineLayer.graphics.filters = [this._waterWarpShader];

    this._app.stage.addChild(this._fishingLineLayer.graphics);

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
  }

  async addBoat(boatDef: BoatDef): Promise<void> {
    const boat = new Boat(this._app, this._events, boatDef);
    this._boats.set(boat.container, boat);
    this._app.stage.addChild(boat.container);
  }

  destroy() {
    this._app.destroy();
    this._boats.forEach((b) => {
      b.destroy();
    });
  }
}
