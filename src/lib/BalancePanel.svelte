<script lang="ts">
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import Icon from "@iconify/svelte";
  import { savedBalance } from "./save-state";

  const balanceValue = tweened(0, {
    duration: 100,
    easing: cubicOut,
  });

  savedBalance.subscribe((value) => {
    balanceValue.set(value);
  });
</script>

<div
  class="flex w-40 select-none bg-neutral-700 items-center gap-2 pr-2 pl-1 py-1 rounded-md"
>
  <Icon icon="game-icons:cash" width="32" height="32" />
  <span class="text-xl ml-auto -mb-1">{$balanceValue.toFixed(2)}</span>
</div>
