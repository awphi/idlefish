import type * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import { viewportPadding, worldHeight, worldWidth } from "./utils";

export function makeViewport(
  app: PIXI.Application,
  parentEl: HTMLElement
): Viewport {
  const viewport = new Viewport({
    events: app.renderer.events,
    screenWidth: parentEl.offsetWidth,
    screenHeight: parentEl.offsetHeight,
    worldWidth,
    worldHeight,
  });
  viewport
    .clamp({
      left: viewportPadding,
      right: worldWidth - viewportPadding,
      top: viewportPadding,
      bottom: worldHeight - viewportPadding,
    })
    .clampZoom({
      // These numbers play nice with the water frag shader
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
  return viewport;
}
