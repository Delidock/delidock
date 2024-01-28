<script lang="ts">
    export let open : boolean
    export let offline : boolean
</script>
<div class="flex flex-row px-2 py-1 text-text_color bg-btn_secondary items-center rounded-lg gap-1">
    <div class="h-2 aspect-square rounded-full bg-red" class:!bg-green={(open && !offline)} class:!bg-gray-400={offline} ></div>
    <p class="text-xs">
        {#if !offline}
            {#if open}
                Opened
                {:else}
                Closed
            {/if}
            {:else}
                Offline
        {/if}
    </p>
</div>