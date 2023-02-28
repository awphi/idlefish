<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import BalancePanel from "./BalancePanel.svelte";
  import BoatInfoPanel from "./BoatInfoPanel.svelte";
  import type { Boat } from "./game/boat";
  import { BOAT_DEFS } from "./game/boat-def";
  import { Game } from "./game/game-controller";

  let game: Game;
  let boat: Boat | null = null;

  onMount(() => {
    game = new Game(document.querySelector("#game-view") as HTMLElement);
    game.addBoat(BOAT_DEFS.pirateShip);
    game.events.on("select", (type, item) => {
      boat = type === "boat" ? item : null;
    });

    game.events.on("boat-update", (updatedBoat) => {
      // Tells svelte to update components - reactivity only extends to stuff inside components!
      if (boat === updatedBoat) {
        boat = boat;
      }
    });
  });

  onDestroy(() => {
    game.destroy();
  });
</script>

<div
  on:contextmenu={(e) => {
    e.preventDefault();
    game.interactions.clearDrag();
  }}
  id="game-view"
  class="w-full h-full"
/>
<div class="fixed left-1 top-1">
  <BalancePanel />
</div>
<div class="fixed right-1 top-1">
  {#if boat !== null}
    <BoatInfoPanel {boat} />
  {/if}
</div>
