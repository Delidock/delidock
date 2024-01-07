<script lang="ts">
	import { SplashScreen } from '@capacitor/splash-screen';
    import { goto } from "$app/navigation";
	import { Doggo } from "$lib/assets/images";
	import { delidock } from "$lib/utils/delidock.js";
	import { onMount } from "svelte";
    
	import { fly } from "svelte/transition";

    onMount( async ()=> {
        if (await delidock.checkToken()) {
            goto('/home', {replaceState: true})
        }
        await SplashScreen.hide();
    })

    export let data

</script>
<main class="h-[100svh] w-screen">
    <div class="h-[10%] w-full flex justify-center items-center">
        <img src={Doggo} class="h-3/4" alt="">
    </div>
    <div class="h-[90%]">
        {#key data.url}
            <div class="h-full" in:fly={{y:200, duration: 300 ,delay:300}} out:fly={{y: 200, duration:300}} >
                <slot/>
            </div>
        {/key}
    </div>
</main>
