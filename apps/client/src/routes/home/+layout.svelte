<script lang="ts">
    import { SplashScreen } from '@capacitor/splash-screen';
	import { goto } from "$app/navigation";
	import { delidock } from "$lib/utils";
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";
    
    export let data

    onMount( async ()=> {
        if (!delidock.checkToken()) {
            goto('/sign/in', {replaceState: true})
        }
        await SplashScreen.hide();
    })

</script>
<div class="bg-background min-h-[100svh]">
    {#key data.url}
        <div in:fly={{y:200, duration: 300 ,delay:300}} out:fly={{y:200, duration:300}} >
            <slot/>
        </div>
    {/key}
</div>