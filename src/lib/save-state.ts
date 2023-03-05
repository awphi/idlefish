import { writable, type Writable } from "svelte/store";
import type { SerializedBoat } from "./game/boat";

const storedBoats = JSON.parse(
  localStorage.getItem("savedBoats")
) as SerializedBoat[];
export const savedBoats: Writable<SerializedBoat[]> = writable(
  storedBoats ?? []
);

savedBoats.subscribe((value) => {
  localStorage.setItem("savedBoats", JSON.stringify(value));
});

const storedBalance = Number.parseFloat(
  localStorage.getItem("savedBalance")
) as number;
export const savedBalance = writable(
  storedBalance && !Number.isNaN(storedBalance) ? storedBalance : 0
);

savedBalance.subscribe((value) => {
  localStorage.setItem("savedBalance", value.toString());
});
