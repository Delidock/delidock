<script lang="ts">
    import "../app.css";

    import { goto } from "$app/navigation";
	import { delidock } from "$lib/utils";
	import { onMount } from "svelte";
	import { socketStore } from "$lib/stores";
    
    
    onMount(async ()=> {
        console.log(await delidock.checkToken());
        
        if (await delidock.checkToken()) {
            if (!$socketStore) {
                delidock.socketConnect()
            }
            goto('/home', {replaceState: true})
        } else {
            goto('/sign/in', {replaceState: true})
        }
    })
</script>
<main class="bg-secondary w-full min-h-[100svh]">
    <slot/>
</main>