<script>
	import { slide } from "svelte/transition";
    import "../app.css";

    export let data
</script>
<main class="bg-secondary w-full min-h-[100svh]">
    {#key data.url}
        <div transition:slide>
            <slot/>
        </div>
    {/key}
</main>