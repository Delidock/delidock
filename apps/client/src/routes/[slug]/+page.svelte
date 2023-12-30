<script lang="ts">
import { goto } from '$app/navigation';
import { PlusIcon, GearIcon, LeftArrowIcon } from '$lib/assets/icons'
	import { Box } from '$lib/types/index.js';

export let data
const box = new Box(data.box.name, data.box.id, data.box.pin, data.box.livekitToken, data.box.livekitServer, data.box.opened)

</script>
<div class="w-full min-h-screen bg-background pt-4 px-4">
    <div class="flex flex-row items-center justify-between">
        <button on:click|preventDefault={()=>goto("/")} class="active:scale-90 transition-transform ease-in-out"><LeftArrowIcon/></button>
        <h1 class="text-text_color">{$box.name}</h1>
        <h1 class="text-text_color">{$box.pin}</h1>
        <button class="active:scale-90 transition-transform ease-in-out"><GearIcon/></button>
    </div>
</div>