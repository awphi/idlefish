import * as PIXI from "pixi.js";
import "@pixi/math-extras";
import waterWarpShaderSrc from "./shaders/water-warp-frag.glsl?raw";
import pixellateShaderSrc from "./shaders/pixellate.glsl?raw";
import { makeBackgroundWaterSprite } from "./layers/background-water-sprite";
import { Boat } from "./boat";
import { makeBoatIndicatorLayer } from "./layers/boat-indicator-layer";
import { makeFishingLineLayer } from "./layers/fishing-line-layer";
import type { BoatDef } from "./boat-def";
import { Interactions } from "./interactions";
import { Events } from "./events";
import {
  makeBoatTextLayer,
  type BoatTextLayer,
} from "./layers/boat-text-layer";

export class Game {
  private _app: PIXI.Application;

  private _interactions: Interactions;
  private _events = new Events();

  // Layers are in ascending order
  private _waterLayers: PIXI.Container;
  private _boatIndicationLayer = makeBoatIndicatorLayer();
  private _fishingLineLayer = makeFishingLineLayer();
  private _boatLayer = new PIXI.Container();
  private _boatTextLayer: BoatTextLayer;

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

    this._waterLayers = new PIXI.Container();
    this._waterLayers.filters = [
      this._waterWarpShader,
      this._4xPixellateShader,
    ];

    this._app.resizeTo = parentEl;
    this._waterLayers.addChild(
      makeBackgroundWaterSprite(this._app, this._globalUniforms)
    );
    this._waterLayers.addChild(this._boatIndicationLayer.graphics);
    this._fishingLineLayer.graphics.filters = [this._waterWarpShader];

    this._boatTextLayer = makeBoatTextLayer(this._app);

    this._app.stage.addChild(this._waterLayers);
    this._app.stage.addChild(this._fishingLineLayer.graphics);
    this._app.stage.addChild(this._boatLayer);
    this._app.stage.addChild(this._boatTextLayer.container);

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
  }

  addBoat(boatDef: BoatDef): void {
    const boat = new Boat(this._app, this._events, boatDef);
    this._boats.set(boat.container, boat);
    this._boatLayer.addChild(boat.container);
    boat.setPosition(this._app.stage.width / 2, this._app.stage.height / 2);
  }

  destroy() {
    this._app.destroy();
    this._boats.forEach((b) => {
      b.destroy();
    });
  }
}
