<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import BalancePanel from "./BalancePanel.svelte";
  import BoatInfoPanel from "./BoatInfoPanel.svelte";
  import FleetPanel from "./FleetPanel.svelte";
  import type { Boat } from "./game/boat";
  import { BOAT_DEFS } from "./game/boat-def";
  import { Game } from "./game/game-controller";

  let game: Game;
  let boats: Boat[] = [];
  let selectedBoat: Boat | null = null;
  let isFollowingSelected = false;

  $: if (selectedBoat !== null && isFollowingSelected) {
    game.viewport.animate({
      position: {
        x: selectedBoat.container.x,
        y: selectedBoat.container.y,
      },
      time: 100,
    });
  }

  onMount(() => {
    game = new Game(document.querySelector("#game-view") as HTMLElement);
    game.events.on("select", (type, item) => {
      selectedBoat = type === "boat" ? boats[boats.indexOf(item)] : null;
      isFollowingSelected = type === "boat";
    });

    game.events.on("boat-add", (boat) => {
      boats = [...boats, boat];
    });

    game.events.on("boat-remove", (boat) => {
      boats = boats.filter((a) => a !== boat);
    });

    game.viewport.on("drag-start", () => {
      isFollowingSelected = false;
    });

    game.events.on("boat-update", (updatedBoat) => {
      const idx = boats.indexOf(updatedBoat);
      if (idx !== -1) {
        boats[idx] = updatedBoat;
      }

      if (updatedBoat === selectedBoat) {
        selectedBoat = updatedBoat;
      }
    });

    game.addBoat(BOAT_DEFS.pirateShip, { x: 5200, y: 5000 });
    game.addBoat(BOAT_DEFS.pirateShip, { x: 4800, y: 5000 });
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
  {#if selectedBoat !== null}
    <BoatInfoPanel boat={selectedBoat} />
  {/if}
</div>

<div class="fixed left-1 bottom-1">
  <FleetPanel {boats} bind:selectedBoat bind:isFollowingSelected />
</div>
