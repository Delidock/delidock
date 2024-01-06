<script lang="ts">
    import "../app.css";

    import { goto } from "$app/navigation";
	import { delidock } from "$lib/utils";
	import { onMount } from "svelte";
	import { socketStore } from "$lib/stores";
    
    
    onMount(()=> {
        console.log("mounting layout");
        
        if (delidock.checkToken()) {
            console.log("token checked");
            
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