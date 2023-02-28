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
import { Viewport } from "pixi-viewport";
import { worldHeight, worldWidth } from "./utils";

export class Game {
  private _app: PIXI.Application;
  private _viewport: Viewport;

  private _interactions: Interactions;
  private _events = new Events();

  // Layers are in ascending order
  private _waterLayers: PIXI.Container;
  private _boatIndicationLayer = makeBoatIndicatorLayer();
  private _fishingLineLayer: FishingLineLayer;
  private _boatLayer = new PIXI.Container();
  private _boatTextLayer: BoatTextLayer;

  private _boats: Map<PIXI.Container, Boat> = new Map();

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
    const viewport = new Viewport({
      events: this._app.renderer.events,
      screenWidth: parentEl.offsetWidth,
      screenHeight: parentEl.offsetHeight,
      worldWidth,
      worldHeight,
    });
    this._viewport = viewport;
    // These numbers play nice with the water frag shader
    viewport
      .clampZoom({
        minScale: 0.543367431263029,
        maxScale: 1,
      })
      .drag({
        mouseButtons: "right middle",
      })
      .pinch()
      .wheel()
      .decelerate();
    viewport.moveCenter(viewport.worldWidth / 2, viewport.worldHeight / 2);
    this._app.stage.addChild(viewport);
    this._app.resizeTo = parentEl;

    // Ticker to update global uniforms
    this._app.ticker.add((delta) => {
      this._globalUniforms.maxPixelSize = 4 * viewport.scale.x;
      console.log(viewport.scale.x);
      this._globalUniforms.glintSize = 70 / viewport.scale.x;
      this._globalUniforms.time += delta * 0.01;
    });

    this._waterLayers = new PIXI.Container();
    this._waterLayers.filters = [
      this._waterWarpShader,
      this._dynamicPixellateShader,
    ];

    this._waterLayers.addChild(makeBackgroundWaterSprite(this._globalUniforms));
    this._waterLayers.addChild(this._boatIndicationLayer.graphics);
    this._fishingLineLayer = makeFishingLineLayer(viewport);
    this._fishingLineLayer.graphics.filters = [this._waterWarpShader];

    this._boatTextLayer = makeBoatTextLayer(this._app);

    viewport.addChild(this._waterLayers);
    viewport.addChild(this._fishingLineLayer.graphics);
    viewport.addChild(this._boatLayer);
    viewport.addChild(this._boatTextLayer.container);

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
    const boat = new Boat(this, boatDef);
    this._boats.set(boat.container, boat);
    this._boatLayer.addChild(boat.container);
    boat.setPosition(worldWidth / 2, worldHeight / 2);
  }

  destroy() {
    this._app.destroy();
    this._boats.forEach((b) => {
      b.destroy();
    });
  }
}
