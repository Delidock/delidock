<script>
	import { fly, slide } from "svelte/transition";
    import "../app.css";
	import { onMount } from "svelte";
</script>
<main class="bg-secondary w-full min-h-[100svh]">
    <slot/>
</main>