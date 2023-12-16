<script lang="ts">
    export let label : string | null = null
    export let icon : any | null = null
</script>
<button on:click class="h-full w-full bg-btn_secondary rounded-lg flex flex-col justify-center items-center unsolid-shadow active:bg-btn_pressed active:scale-95 transition-all ease-in-out">
    <div class="flex flex-col justify-center items-center h-2/4">
        {#if icon}
            <svelte:component this={icon}/>
        {/if}
        {#if label}
            <p class="text-text_color text-[0.5rem]">{label}</p>
        {/if}
    </div>
</button>