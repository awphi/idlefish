<script lang="ts">
  import type { Boat } from "./game/boat";

  export let boats: Boat[];
  export let selectedBoat: Boat;
</script>

<div class="flex flex-col select-none gap-2 pr-2 rounded-md">
  {#each boats as boat, i}
    <button
      class="bg-neutral-700 rounded-md flex p-1"
      class:contrast-150={selectedBoat === boat}
      class:hover:contrast-125={selectedBoat !== boat}
      on:click={() => (selectedBoat = boat)}
    >
      <div class="w-12 h-12 p-1  flex justify-center items-center">
        <img
          src={boat.boatDef.texture}
          class="h-full w-auto -rotate-45"
          alt={boat.boatDef.name + " " + i}
        />
      </div>
      <div class="flex flex-col">
        <span>x: {boat.container.x.toFixed(1)}</span>
        <span>y: {boat.container.y.toFixed(1)}</span>
      </div>
    </button>
  {/each}
</div>
