<script lang="ts">
	import { Doggo } from "$lib/assets/images";
    
	import { fly } from "svelte/transition";
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
