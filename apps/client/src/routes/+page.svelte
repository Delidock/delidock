<script lang="ts">
	import { goto } from "$app/navigation";
	import { delidock } from "$lib/utils";
	import { onMount } from "svelte";

    onMount(()=> {
        
        if (delidock.checkToken()) {
            goto('/home', {replaceState: true})
        } else {
            goto('/sign/in', {replaceState: true})
        }
    })
</script>
<div class="bg-background w-screen h-screen flex flex-col justify-center items-center">
    <p class="text-text_color text-2xl">Delidock is loading</p>
    <p class="text-text_color text-base">chipi chipi chapa chapa</p>
</div>