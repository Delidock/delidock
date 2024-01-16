<script lang="ts">
	import { goto } from "$app/navigation";
	import BoxIcon from "$lib/assets/icons/BoxIcon.svelte";
	import CheckmarkIcon from "$lib/assets/icons/CheckmarkIcon.svelte";
	import CrossIcon from "$lib/assets/icons/CrossIcon.svelte";
	import { Button } from "$lib/components";
    import { AddNewStatus, addingStatus } from "$lib/stores";


    
</script>
<section class="w-full h-screen bg-background text-text_color flex flex-col justify-center items-center gap-4">
    {#if $addingStatus === AddNewStatus.WAITING}
            <p class="text-text_color text-lg">Your delidock is being added</p>
            <div class="animate-spin"><BoxIcon/></div>
        {:else if $addingStatus === AddNewStatus.SUCESS}
            <p class="text-text_color text-lg">Your delidock has been added!</p>
            <div><CheckmarkIcon/></div>
            <div class="w-48"><Button label="OK" on:click={()=>goto('/home', {replaceState: true})}/></div>
        {:else if $addingStatus === AddNewStatus.FAIL}
            <p class="text-text_color text-lg">Something went wrong</p>
            <div><CrossIcon/></div>
            <div class="w-48"><Button label="OK :(" on:click={()=>goto('/home', {replaceState: true})}/></div>
    {/if}
</section>