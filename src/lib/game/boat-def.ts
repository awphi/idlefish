export interface BoatDef {
  name: string;
  texture: string;
  turningSpeed: number;
  speed: number;
  fishCapacity: number;
  seats: [number, number][];
  wakeEmitters: [number, number][];
}

export const BOAT_DEFS: { [k: string]: BoatDef } = {
  pirateShip: {
    name: "Pirate Ship",
    texture: "pirate_ship.png",
    turningSpeed: 0.01,
    speed: 1,
    fishCapacity: 10,
    seats: [
      [0.9, 0.4],
      [0.9, 0.5],
      [0.9, 0.6],
      [0.1, 0.4],
      [0.1, 0.5],
      [0.15, 0.6],
    ],
    wakeEmitters: [
      [0.2, 0.2],
      [0.9, 0.2],
    ],
  },
};
