import type { Boat } from "./boat";

export class Events {
  private _eventListeners: Map<string, ((...args: any[]) => void)[]>;

  constructor(events = ["select", "boat-update"]) {
    this._eventListeners = new Map(events.map((e) => [e, []]));
  }

  on(event: "select", f: (type: "boat" | null, item?: Boat) => void): void;
  on(event: "boat-update", f: (item: Boat) => void): void;

  on(event: string, f: (...args: any[]) => void): void {
    if (!this._eventListeners.has(event)) {
      throw new Error("Invalid event: " + event);
    }

    this._eventListeners.get(event).push(f);
  }

  fire(event: "select", args: "boat" | null, item?: Boat): void;
  fire(event: "boat-update", item: Boat): void;

  fire(event: string, ...args: any[]): void {
    this._eventListeners.get(event)?.forEach((f) => {
      f(...args);
    });
  }
}
