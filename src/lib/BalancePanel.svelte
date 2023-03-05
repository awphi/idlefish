<script lang="ts">
  import Icon from "@iconify/svelte";
  import { savedBalance } from "./save-state";

  let balanceValue: number;

  savedBalance.subscribe((value) => {
    // TODO lerp
    balanceValue = value;
  });
</script>

<div
  class="flex w-32 select-none bg-neutral-700 items-center gap-2 pr-2 pl-1 py-1 rounded-md"
>
  <Icon icon="game-icons:cash" width="32" height="32" />
  <span class="text-xl ml-auto -mb-1">{balanceValue.toFixed(2)}</span>
</div>
