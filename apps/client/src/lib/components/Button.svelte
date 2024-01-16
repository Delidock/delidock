<script lang="ts">
    export let label : string
    export let type : string = "button"
</script>
{#if type === "submit"}
    <button on:click type="submit" class="bg-btn_secondary w-full h-10 rounded-lg shadow-md active:bg-btn_pressed">
        <p class="text-text_color text-sm">{label}</p>
    </button>
    {:else}
    <button on:click type="button" class="bg-btn_secondary w-full h-10 rounded-lg shadow-md active:bg-btn_pressed transition-colors ease-in-out">
        <p class="text-text_color text-sm">{label}</p>
    </button>
{/if}