<script>
	import { slide } from "svelte/transition";
    import "../app.css";
	import { onMount } from "svelte";
	import Cookies from "universal-cookie";
	import { goto } from "$app/navigation";

    onMount(()=>{
        if ((new Cookies().get('token'))) {
            goto('/', {replaceState: true})
        }
    })
</script>
<main class="bg-secondary w-full min-h-[100svh]">
    <div transition:slide>
        <slot/>
    </div>
</main>