<script lang="ts">
	import type { ComponentType } from "svelte";
    export let label : string | null = null
    export let icon : ComponentType | null = null
    export let offline : boolean = false
</script>
<button on:click class="h-full w-full bg-btn_secondary rounded-lg flex flex-col justify-center items-center transition-all ease-in-out" class:active:bg-btn_pressed={!offline} class:active:scale-95={!offline} class:unsolid-shadow={!offline} class:!bg-btn_unclickable={offline}>
    <div class="flex flex-col justify-center items-center h-2/4 " class:opacity-50={offline}>
        {#if icon}
            <svelte:component this={icon} />
        {/if}
        {#if label}
            <p class="text-text_color text-[0.5rem]">{label}</p>
        {/if}
    </div>
</button>