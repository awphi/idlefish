import type { Boat } from "./boat";
import type { Fish } from "./fish";

export class Events {
  private _eventListeners: Map<string, ((...args: any[]) => void)[]> =
    new Map();

  on(event: "select", f: (type: "boat" | null, item?: Boat) => void): void;
  on(event: "boat-update", f: (boat: Boat) => void): void;
  on(event: "boat-catch", f: (boat: Boat, fish: Fish) => void): void;
  on(event: "boat-add", f: (boat: Boat) => void): void;
  on(event: "boat-remove", f: (boat: Boat) => void): void;

  on(event: string, f: (...args: any[]) => void): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }

    this._eventListeners.get(event).push(f);
  }

  fire(event: "select", args: "boat" | null, item?: Boat): void;
  fire(event: "boat-update", boat: Boat): void;
  fire(event: "boat-catch", boat: Boat, fish: Fish): void;
  fire(event: "boat-add", boat: Boat): void;
  fire(event: "boat-remove", boat: Boat): void;

  fire(event: string, ...args: any[]): void {
    this._eventListeners.get(event)?.forEach((f) => {
      f(...args);
    });
  }
}
