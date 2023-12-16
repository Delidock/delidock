<script lang="ts">
    export let label : string
    export let type : string
</script>
{#if type === "submit"}
    <button type="submit" class="bg-btn_secondary w-full h-11 rounded-lg shadow-md active:bg-btn_pressed">
        <p class="text-text_color">{label}</p>
    </button>
    {:else}
    <button type="button" class="bg-btn_secondary w-full h-11 rounded-lg shadow-md active:bg-btn_pressed transition-colors ease-in-out">
        <p class="text-text_color">{label}</p>
    </button>
{/if}