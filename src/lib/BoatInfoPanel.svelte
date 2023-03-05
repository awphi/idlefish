<script lang="ts">
  import type { Boat } from "./game/boat";
  import Icon from "@iconify/svelte";
  import { scale } from "svelte/transition";
  import { quintInOut } from "svelte/easing";
  import { tick } from "svelte";
  import type { Game } from "./game/game-controller";
  import type { Fish } from "./game/fish";
  import { savedBalance } from "./save-state";

  export let boat: Boat;
  export let game: Game;

  function sellFish(fish: Fish): void {
    if (boat.removeFish(fish)) {
      savedBalance.update((v) => v + fish.score);
      // TODO sound effect
    }
  }

  let inventoryElement: HTMLDivElement;
  let isInShop: boolean;
  $: isInShop = game
    .getZonesAt(boat.container.x, boat.container.y)
    .some((a) => a.role === "shop");

  $: if (boat.inventory) {
    tick().then(() => {
      inventoryElement.scroll({ top: inventoryElement.scrollHeight });
    });
  }
</script>

<div
  transition:scale
  class="select-none bg-neutral-700 p-2 rounded-md shadow-sm flex flex-col w-72"
>
  <h1 class="text-2xl">{boat.boatDef.name}</h1>
  <hr class="mb-2" />
  <div class="boat-stat-display">
    <div class="flex flex-col gap-2">
      <div class="stat-box">
        <Icon icon="mdi:speedometer" />
        <span>{boat.boatDef.speed}u/s</span>
      </div>
      <div class="stat-box">
        <Icon icon="mdi:angle-obtuse" />
        <span>{boat.boatDef.turningSpeed * 10}u/s</span>
      </div>
      <div class="stat-box">
        <Icon icon="mdi:account" />
        <span>{boat.boatDef.seats.length}</span>
      </div>
      <div class="stat-box">
        <Icon icon="mdi:fish" />
        <span>{boat.boatDef.fishCapacity}</span>
      </div>
    </div>

    <div class="flex w-full items-center justify-center px-2">
      <img
        src={boat.boatDef.texture}
        class="drop-shadow-xl w-1/3"
        alt={boat.boatDef.name}
      />
    </div>

    <p class="absolute" />
  </div>
  <hr class="mt-2 mb-1" />
  <h1 class="text-xl">
    Inventory ({boat.inventory.length}/{boat.boatDef.fishCapacity})
  </h1>
  <div
    bind:this={inventoryElement}
    class="h-32 rounded-md bg-black bg-opacity-20 overflow-y-scroll gap-1 flex flex-col px-2 py-1"
  >
    {#each boat.inventory as fish}
      <div class="flex" transition:scale={{ easing: quintInOut }}>
        <span class="flex text-sm" style:color={fish.color}>{fish.name}</span>
        {#if isInShop}
          <button
            class="ml-auto bg-neutral-800 bg-opacity-50 px-2 rounded-md hover:contrast-125 cont disabled:contrast-75"
            on:click={() => sellFish(fish)}>Sell</button
          >
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .stat-box {
    @apply flex items-center gap-2 border-[1px] rounded-md px-1 shadow-md bg-black bg-opacity-10;
  }

  .stat-box > span {
    @apply ml-auto mt-[2px];
  }

  .boat-stat-display {
    @apply grid;
    grid-template-columns: min-content 1fr;
  }
</style>
